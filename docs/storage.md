Storage
=======

Todo items are stored as a giant array with an indexing structure that maps 
`todo.completedAt` to index in the array. New todo item is always appended to
the end of the array. When a todo item is deleted, the item on the giant array
is set to null. This will leave empty slot in the giant array but right now
this is not an issue as we suspect that delete rarely occurs.
