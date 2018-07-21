
# Api Gateway -> Lambda (Update) -> DynamoDB

## Description

This is a Lambda function that updates an item in the DynamoDB database, based on the API Gateway request data.

- Supports CORS
- Written in Node.js

It's a Nuts & Bolts application component for AWS Serverless Application Repository.

## Latest Release - 1.0.4

Added a few fixes regarding the CORS and datatable naming:

- Fixed the missing TABLE_NAME environment parameter
- Enabled underscore `_` as an enabled character in the table name
- Fixed the CORS issue, now the PUT requests are CORS enabled as well
- Added a `ValidationException` Reserved Keywords error response reply

## Roadmap - Upcoming changes

Here are the upcoming changes that I'll add to this serverless component:

- ESLint
- Tests
