import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodosAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return todoAccess.getAllTodos(userId)
}

export async function deleteTodo(
    userId: string,
    todoId: string) {
    
    return await todoAccess.deleteTodo(
        userId,
        todoId
    )
}

export async function todoExists(
    userId: string,
    todoId: string) {

    return await todoAccess.todoExists(
        userId,
        todoId
    )
}

export async function createTodo(
    userId: string,
    CreateTodoRequest: CreateTodoRequest
): Promise<TodoItem> {

    const todoId = uuid.v4()
    return await todoAccess.createTodo({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: CreateTodoRequest.name,
        dueDate: CreateTodoRequest.dueDate,
        done: false
    })
}

export async function updateTodo(
    userId: string,
    todoId: string,
    UpdateTodoRequest: UpdateTodoRequest
) {
    return await todoAccess.updateTodo(
        userId,
        todoId,
        UpdateTodoRequest)
}

export async function addAttachment(
    userId: string,
    todoId: string,
    attachmentUrl: string
) {
    return await todoAccess.addAttachment(
        userId,
        todoId,
        attachmentUrl)
}