import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as uuid from 'uuid'
import * as AWS from 'aws-sdk'
import { getUserId } from '../utils'
import { todoExists, addAttachment } from '../../businessLogic/todos'

import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')

const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Caller event' + JSON.stringify(event))
  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  const validTodoId = await todoExists(userId, todoId)

  if (!validTodoId) {
    logger.error('Todo does not exist')
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }

  const attachmentId = uuid.v4()
  const url = getUploadUrl(attachmentId)
  const attachmentURL = `https://${bucketName}.s3.amazonaws.com/${attachmentId}`
  
  logger.info('Created an attachment URL:' + attachmentURL)

  await addAttachment(userId, todoId, attachmentURL)

  logger.info('Added a attachment URL to ' + todoId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}

function getUploadUrl(attachmentId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: attachmentId,
    Expires: parseInt(urlExpiration)
  })
}
