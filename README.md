# pfm-slack-lambda

Send pfm weekly summary to Slack.

<img width="394" alt="2019-02-24 14 37 03" src="https://user-images.githubusercontent.com/26884355/53295658-85302500-3843-11e9-9839-024599839358.png">

## Settings
### AWS
Create IAM user.
https://qiita.com/ai-2723/items/fe83669768f8277f144c

You should add the following access to your IAM user.

- AdministratorAccess

or

- Lambda
- S3
- CloudWatch
etc.

And copy API Key & Secret.

https://serverless.com/framework/docs/providers/aws/guide/credentials/

### Local machine
1. `git clone https://github.com/thinceller/pfm-slack-lambda.git`
2. `cd pfm-slack-lambda && npm i`
3. Create `.env` file. Here is sample `.env` file: `.env.sample`
```bash
# .env
EMAIL=YOUR_PFM_MAIL@gmail.com
PASSWORD=YOUR_PFM_PASSWORD
SLACK_WEBHOOK_URL=http://WEBHOOK_URL_TO_SEND_MESSAGE
YOUR_NAME=YOUR_NAME
```
You have to get Incoming Webhook URL.

https://api.slack.com/incoming-webhooks

## Deploy
1. `npm i -g serverless`
2. Run folowing command.
```
export AWS_ACCESS_KEY_ID=<your-key-here>
export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
serverless deploy
```
