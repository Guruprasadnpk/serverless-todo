import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
const logger = createLogger('todoAccess')

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
const XAWS = AWSXRay.captureAWS(AWS)

const todoIdIndex = process.env.TODO_ID_INDEX
export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getAllTodos(userId: String): Promise<TodoItem[]> {
        logger.info('Getting all todos')

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: todoIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()

        return todoItem
    }

    async deleteTodo(userId: string, todoId: string) {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        }).promise()
    }

    async updateTodo(userId: string, todoId: string, updatedTodo: TodoUpdate) {
        const params = {
            TableName: this.todosTable,
            Key: {userId: userId, todoId: todoId},
            UpdateExpression: "set #na = :name, dueDate = :dueDate, done = :done",
            ExpressionAttributeNames: { 
                "#na": "name"
            },
            ExpressionAttributeValues: {
                ":name": updatedTodo.name,
                ":dueDate": updatedTodo.dueDate,
                ":done": updatedTodo.done
            }
        }
        await this.docClient.update(params).promise()
        }

    async addAttachment(userId: string, todoId: string, attachmentUrl: string) {
        const params = {
            TableName: this.todosTable,
            Key: { userId: userId, todoId: todoId },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": attachmentUrl
            }
        }
        await this.docClient.update(params).promise()
    }

    async todoExists(userId: string, todoId: string) {
        logger.info({
            userId: userId,
            todoId: todoId
        })
    const result = await this.docClient
        .get({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        })
        .promise()

        logger.info('Get Todo: ' + JSON.stringify(result))
    return !!result.Item
}
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        })
    }

    return new XAWS.DynamoDB.DocumentClient()
}
