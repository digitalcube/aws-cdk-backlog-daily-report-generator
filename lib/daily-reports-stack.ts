import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Tags } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

export class DailyReportsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // スタック（CloudFormation）自体にタグを追加

    const backlogDailyReport = new NodejsFunction(this, 'BacklogDailyReport', {
      entry: 'lambda/backlog-daily-report.ts',
      handler: 'handler',
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.minutes(5),
    });

    // パラメータストアへの読み取り権限を追加
    const parameterArn = `arn:aws:ssm:${this.region}:${this.account}:parameter/backlog-api-key`;
    backlogDailyReport.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [parameterArn],
      })
    );

    // Amazon Bedrockへのアクセス権限を追加
    backlogDailyReport.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'bedrock:InvokeModel',
          'bedrock:InvokeModelWithResponseStream',
          'bedrock:Converse'
        ],
        resources: ['*'],
      })
    );

    // EventBridgeスケジュールを設定して平日の日本時間午後7時（UTC午前10時）に実行
    const rule = new events.Rule(this, 'DailyReportSchedule', {
      schedule: events.Schedule.cron({
        minute: '0',
        hour: '10', // UTC午前10時 = 日本時間午後7時
        weekDay: 'MON-FRI',
      }),
      description: '平日の日本時間午後7時にBacklogの日報を生成',
    });

    // Lambda関数をターゲットとして追加
    rule.addTarget(new targets.LambdaFunction(backlogDailyReport));

    /**
     * まとめてタグ付け
     */
    const tags = [{
      key: 'Environment',
      value: 'Production'
    }, {
      key: 'Owner',
      value: 'hidetaka@digitalcube.jp'
    }];
    [this, backlogDailyReport, rule].forEach(resource => {
      tags.forEach(tag => {
        Tags.of(resource).add(tag.key, tag.value);
      });
    });
  }
}
