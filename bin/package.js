#!/usr/bin/env node

/**
 * Builds app binaries for Mac, Windows, and Linux.
 */

const cp = require('child_process')
const path = require('path')

const electronPackager = require('electron-packager')
const minimist = require('minimist')
const rimraf = require('rimraf')
const zip = require('cross-zip')

const config = require('../src/config')
const pkg = require('../package.json')

const BUILD_PATH = path.join(config.ROOT_PATH, 'build')
const DIST_PATH = path.join(config.ROOT_PATH, 'dist')
const NODE_MODULES_PATH = path.join(config.ROOT_PATH, 'node_modules')

const argv = minimist(process.argv.slice(2), {
  boolean: [
    'sign'
  ],
  default: {
    package: 'all',
    sign: false
  },
  string: [
    'package'
  ]
})

function build() {
  console.log('Installing node_modules...')
  rimraf.sync(NODE_MODULES_PATH)
  cp.execSync('npm ci', { stdio: 'inherit' })

  console.log('Nuking dist/ and build/...')
  rimraf.sync(DIST_PATH)
  rimraf.sync(BUILD_PATH)

  console.log('Build: Transpiling to ES5...')
  cp.execSync('npm run build', { NODE_ENV: 'production', stdio: 'inherit' })
  console.log('Build: Transpiled to ES5.')

  const platform = argv._[0]
  if (platform === 'darwin') {
    buildDarwin(printDone)
  } else if (platform === 'win32') {
    buildWin32(printDone)
  } else if (platform === 'linux') {
    buildLinux(printDone)
  } else {
    buildDarwin(function(err) {
      printDone(err)
      buildWin32(function(err) {
        printDone(err)
        buildLinux(printDone)
      })
    })
  }
}

const all = {
  // The human-readable copyright line for the app. Maps to the `LegalCopyright` metadata
  // property on Windows, and `NSHumanReadableCopyright` on Mac.
  appCopyright: config.APP_COPYRIGHT,

  // The release version of the application. Maps to the `ProductVersion` metadata
  // property on Windows, and `CFBundleShortVersionString` on Mac.
  appVersion: pkg.version,

  // The application source directory.
  dir: config.ROOT_PATH,

  // Pattern which specifies which files to ignore when copying files to create the
  // package(s).
  ignore: /^\/src|^\/dist/,

  // The application name.
  name: config.APP_NAME,

  // The base directory where the finished package(s) are created.
  out: DIST_PATH,

  // Replace an already existing output directory.
  overwrite: true,

  // Runs `npm prune --production` which remove the packages specified in
  // "devDependencies" before starting to package the app.
  prune: true,

  // The Electron version that the app is built with (without the leading 'v')
  electronVersion: require('electron/package.json').version
}

const darwin = {
  // Build for Mac
  platform: 'darwin',

  // Build x64 binary only.
  arch: 'x64',

  // The bundle identifier to use in the application's plist (Mac only).
  appBundleId: 'io.todohero.todohero',

  // The application category type, as shown in the Finder via "View" -> "Arrange by
  // Application Category" when viewing the Applications directory (Mac only).
  appCategoryType: 'public.app-category.utilities',

  // The bundle identifier to use in the application helper's plist (Mac only).
  helperBundleId: 'io.todohero.todohero-helper',

  // Application icon.
  icon: config.APP_ICON + '.icns'
}

const win32 = {
}

const linux = {
}

build()

function buildDarwin(cb) {
  const plist = require('plist')

  console.log('Mac: Packaging electron...')
  electronPackager(Object.assign({}, all, darwin)).then(function(buildPath) {
    console.log('Mac: Packaged electron. ' + buildPath)

    const appPath = path.join(buildPath[0], config.APP_NAME + '.app')
    const contentsPath = path.join(appPath, 'Contents')
    const resourcesPath = path.join(contentsPath, 'Resources')

    cp.execSync(`cp ${config.APP_ICON + '.icns'} ${resourcesPath}`)

    function pack(cb) {
      packageZip()

      if (argv.package === 'dmg' || argv.package === 'all') {
        packageDmg(cb)
      }
    }

    function packageZip() {
      // Create .zip file (used by the auto-updater)
      console.log('Mac: Creating zip...')

      const inPath = path.join(buildPath[0], config.APP_NAME + '.app')
      const outPath = path.join(DIST_PATH, BUILD_NAME + '-darwin.zip')
      zip.zipSync(inPath, outPath)

      console.log('Mac: Created zip.')
    }

    function packageDmg(cb) {
      console.log('Mac: Creating dmg...')

      const appDmg = require('appdmg')

      const targetPath = path.join(DIST_PATH, BUILD_NAME + '.dmg')
      rimraf.sync(targetPath)

      // Create a .dmg (Mac disk image) file, for easy user installation.
      const dmgOpts = {
        basepath: config.ROOT_PATH,
        target: targetPath,
        specification: {
          title: config.APP_NAME,
          icon: config.APP_ICON + '.icns',
          background: path.join(config.STATIC_PATH, 'appdmg.png'),
          'icon-size': 128,
          contents: [
            { x: 122, y: 240, type: 'file', path: appPath },
            { x: 380, y: 240, type: 'link', path: '/Applications' },
            // Hide hidden icons out of view, for users who have hidden files shown.
            // https://github.com/LinusU/node-appdmg/issues/45#issuecomment-153924954
            { x: 50, y: 500, type: 'position', path: '.background' },
            { x: 100, y: 500, type: 'position', path: '.DS_Store' },
            { x: 150, y: 500, type: 'position', path: '.Trashes' },
            { x: 200, y: 500, type: 'position', path: '.VolumeIcon.icns' }
          ]
        }
      }

      const dmg = appDmg(dmgOpts)
      dmg.once('error', cb)
      dmg.on('progress', function(info) {
        if (info.type === 'step-begin') console.log(info.title + '...')
      })
      dmg.once('finish', function(info) {
        console.log('Mac: Created dmg.')
        cb(null)
      })
    }
  }).catch(function(err) {
    cb(err)
  })
}

function buildWin32(cb) {
}

function buildLinux(cb) {
}

function printDone(err) {
  if (err) console.error(err.message || err)
}

