/**
 * office-maker-api migration script
 *
 * This script copies all data in DynamoDB and S3 from one environment to another environment
 * It is useful when you create a new environment and need some test data
 *
 * Example) migrate from `stg` environment to `dev` environment
 * ~$ ./migrate.sh stg dev
 *
 * Remark: if AWS Backup comes to ap-northeast-1 region, you might use it instead.
 */
import * as aws from 'aws-sdk';

// Specify region by environment variable `REGION`. Default is `ap-northeast-1`
const region = process.env.REGION || 'ap-northeast-1';

const dynamo = new aws.DynamoDB.DocumentClient({
  region
});
const s3 = new aws.S3({
  region
});

// Split an array into smaller chunks
const chunksOf = <T>(arr: T[], len: number) => {
  let chunks: T[][] = [],
    i = 0,
    n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, (i += len)));
  }

  return chunks;
};

const scanAndCopyTable = async (sourceTable: string, targetTable: string) => {
  const scanResult = await dynamo
    .scan({
      TableName: sourceTable
    })
    .promise();

  await chunksOf(scanResult.Items, 25).forEach(async (items, index) => {
    await dynamo
      .batchWrite({
        RequestItems: {
          [targetTable]: items.map(item => {
            return {
              PutRequest: {
                Item: item
              }
            };
          })
        }
      })
      .promise();

    console.info(
      `Copying: ${sourceTable} --> ${targetTable}, ${(index + 1) *
        25} items done...`
    );
  });

  console.info(`Migration done: ${sourceTable} --> ${targetTable}`);
};

type QueryOption = {
  hashKey: {
    name: string;
    value: string;
  };
  rangeKey?: {
    name: string;
    value: string;
  };
};

const queryAndCopyTable = async (
  sourceTable: string,
  targetTable: string,
  option: QueryOption
) => {
  const queryResult = await dynamo
    .query({
      TableName: sourceTable,
      KeyConditionExpression: option.rangeKey
        ? '#hash = :hash AND #range = :range'
        : '#hash = :hash',
      ExpressionAttributeNames: Object.assign(
        {
          '#hash': option.hashKey.name
        },
        option.rangeKey && { '#range': option.rangeKey.name }
      ),
      ExpressionAttributeValues: Object.assign(
        {
          ':hash': option.hashKey.value
        },
        option.rangeKey && { ':range': option.rangeKey.value }
      )
    })
    .promise();

  await chunksOf(queryResult.Items, 25).forEach(async (items, index) => {
    await dynamo
      .batchWrite({
        RequestItems: {
          [targetTable]: items.map(item => {
            return {
              PutRequest: {
                Item: item
              }
            };
          })
        }
      })
      .promise();

    console.info(
      `Copying: ${sourceTable} --> ${targetTable}, ${(index + 1) *
        25} items done...`
    );
  });

  console.info(`Migration done: ${sourceTable} --> ${targetTable}`);
};

const performCopyTable = (
  sourceTable: string,
  targetTable: string,
  option?: QueryOption
) => {
  if (option) {
    return queryAndCopyTable(sourceTable, targetTable, option);
  } else {
    return scanAndCopyTable(sourceTable, targetTable);
  }
};

const performCopyS3 = async (
  sourceBucket: string,
  targetBucket: string,
  option?: {
    prefix: string;
  }
) => {
  const listResult = await s3
    .listObjectsV2(
      Object.assign(
        {
          Bucket: sourceBucket
        },
        option && { Prefix: option.prefix }
      )
    )
    .promise();

  await listResult.Contents.forEach(async content => {
    s3.copyObject({
      Bucket: targetBucket,
      CopySource: `${sourceBucket}/${content.Key}`,
      Key: content.Key
    });
  });

  console.info(`Migration done: ${sourceBucket} --> ${targetBucket}`);
};

if (process.argv.length < 4) {
  console.log(
    `office-maker-api migration script

Usage:
~$ ts-node migrate.ts stg dev
~$ FLOOR_ID=xxxxxxxx ts-node migrate.ts stg dev  # if you want to migrate only a floor`
  );
} else {
  const source = process.argv[2];
  const target = process.argv[3];
  if (target == 'prod') {
    console.error('Do not write to the prod account. Abort.');
    process.exit(1);
  }

  const copyTable = (name, option?: QueryOption) => {
    const tableNameOf = (env, name) => `office-maker-map-${env}_${name}`;
    performCopyTable(
      tableNameOf(source, name),
      tableNameOf(target, name),
      option
    );
  };
  const copyS3 = (option?: { prefix: string }) => {
    const bucketNameOf = env => `office-maker-storage-${env}`;
    performCopyS3(bucketNameOf(source), bucketNameOf(target), option);
  };

  copyTable('colors');
  copyTable('prototypes');
  copyTable(
    'edit_floors',
    process.env.FLOOR_ID && {
      hashKey: {
        name: 'tenantId',
        value: 'worksap.co.jp'
      },
      rangeKey: {
        name: 'id',
        value: process.env.FLOOR_ID
      }
    }
  );
  copyTable(
    'edit_objects',
    process.env.FLOOR_ID && {
      hashKey: {
        name: 'floorId',
        value: process.env.FLOOR_ID
      }
    }
  );
  copyTable(
    'public_floors',
    process.env.FLOOR_ID && {
      hashKey: {
        name: 'tenantId',
        value: 'worksap.co.jp'
      },
      rangeKey: {
        name: 'id',
        value: process.env.FLOOR_ID
      }
    }
  );
  copyTable(
    'public_objects',
    process.env.FLOOR_ID && {
      hashKey: {
        name: 'floorId',
        value: process.env.FLOOR_ID
      }
    }
  );

  copyS3(
    process.env.FLOOR_ID && {
      prefix: `files/floors/${process.env.FLOOR_ID}`
    }
  );

  copyS3(
    process.env.FLOOR_ID && {
      prefix: `images/floors/${process.env.FLOOR_ID}`
    }
  );
}
