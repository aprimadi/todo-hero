Storage
=======

# Todo

Todo items are stored as a giant array with an indexing structure that maps 
`todo.completedAt` to index in the array. New todo item is always appended to
the end of the array. When a todo item is deleted, the item on the giant array
is set to null. This will leave empty slot in the giant array but right now
this is not an issue as we suspect that delete rarely occurs.

TodoStore is the class that is responsible for abstracting the underlying todo
list storage. Its main interface are `items()`, `add()`, `update()`. 
`items()` return a list of todo items that is incomplete and completed today. 
`add()` add the todo item to the underlying giant array and update the index.
`update()` find the todo item in the giant array and update it. `delete()`
deletes the entry in the index and also set the slot to null in the giant 
array.

# Tag

Similar to todo items, tags are stored as a giant array and assigned id equal 
its index in the array. For convenient purpose, the 0-indexed slot is not used
in the tags array, so that the tag id starts from 1 following the database
convention. Contrary to todo items, tags storage doesn't have an indexing 
structure.
