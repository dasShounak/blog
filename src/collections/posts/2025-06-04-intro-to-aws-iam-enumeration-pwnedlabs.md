---
layout: blog
title: Intro to AWS IAM Enumeration | PwnedLabs
publishDate: 2025-06-04T15:55:00.000Z
description: Master AWS IAM basics with this hands-on lab, diving into AWS CLI
  and enumeration of users, roles, groups, and policies for cloud security.
tags:
  - pwnedlabs
  - writeup
  - aws
---
In this lab, an AWS IAM user credentials were provided along with its access and secret access keys. The goal was to enumerate the IAM user and find the associated roles, policies and permitted actions, and find the flag.

First of all, I logged in to the AWS console using the given credentials. Then using the access and secret access keys provided in the description, I configured AWS CLI. To verify the IAM user, I issued the command:

```sh
> aws sts get-caller-identity
{
    "UserId": "AIDA3SFMDAPOWFB7BSGME",
    "Account": "794929857501",
    "Arn": "arn:aws:iam::794929857501:user/dev01"
}
```

To gather more details about the IAM user `dev01`, I used the `get-user` command.

```sh
> aws iam get-user
{
    "User": {
        "Path": "/",
        "UserName": "dev01",
        "UserId": "AIDA3SFMDAPOWFB7BSGME",
        "Arn": "arn:aws:iam::794929857501:user/dev01",
        "CreateDate": "2023-09-28T21:56:31+00:00",
        "PasswordLastUsed": "2025-05-30T11:46:55+00:00",
        "Tags": [
            {
                "Key": "AKIA3SFMDAPOWC2NR5LO",
                "Value": "dev01"
            }
        ]
    }
}
```

I checked if this user was associated with any groups - there were none.

```sh
> aws iam list-groups-for-user --user-name dev01
{
    "Groups": []
}
```

I found a couple of policies attached to the user. Attached user policies are managed separately from the user.

```sh
> aws iam list-attached-user-policies --user-name dev01
{
    "AttachedPolicies": [
        {
            "PolicyName": "AmazonGuardDutyReadOnlyAccess",
            "PolicyArn": "arn:aws:iam::aws:policy/AmazonGuardDutyReadOnlyAccess"
        },
        {
            "PolicyName": "dev01",
            "PolicyArn": "arn:aws:iam::794929857501:policy/dev01"
        }
    ]
}
```

The two user policies are:

- `AmazonGuardDutyReadOnlyAccess` - Amazon managed
- `dev01` - customer managed

Apart from these, I found one inline user policy. Inline user policies are embedded directly into the AWS IAM user, group or role and are not reusable like attached user policies.

```sh
> aws iam list-user-policies --user-name dev01
{
    "PolicyNames": [
        "S3_Access"
    ]
}
```

I found a single policy called `S3_Access` which probably allows the IAM user to access AWS S3 services.

Now I dug deeper into the previous two policies. Amazon and customer managed policies have different versions, revisions. It is possible to list the versions of a policy.

```sh
> aws iam list-policy-versions --policy-arn arn:aws:iam::aws:policy/AmazonGuardDutyReadOnlyAccess
{
    "Versions": [
        {
            "VersionId": "v4",
            "IsDefaultVersion": true,
            "CreateDate": "2023-11-16T23:07:06+00:00"
        },
        {
            "VersionId": "v3",
            "IsDefaultVersion": false,
            "CreateDate": "2021-02-16T23:37:57+00:00"
        },
        {
            "VersionId": "v2",
            "IsDefaultVersion": false,
            "CreateDate": "2018-04-25T21:07:17+00:00"
        },
        {
            "VersionId": "v1",
            "IsDefaultVersion": false,
            "CreateDate": "2017-11-28T22:29:40+00:00"
        }
    ]
}
```

So the current version of the `AmazonGuardDutyReadOnlyAccess` policy was version 4.

```sh
> aws iam get-policy-version --policy-arn arn:aws:iam::aws:policy/AmazonGuardDutyReadOnlyAccess --version-id v4
{
    "PolicyVersion": {
        "Document": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "guardduty:Describe*",
                        "guardduty:Get*",
                        "guardduty:List*"
                    ],
                    "Resource": "*"
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "organizations:ListDelegatedAdministrators",
                        "organizations:ListAWSServiceAccessForOrganization",
                        "organizations:DescribeOrganizationalUnit",
                        "organizations:DescribeAccount",
                        "organizations:DescribeOrganization",
                        "organizations:ListAccounts"
                    ],
                    "Resource": "*"
                }
            ]
        },
        "VersionId": "v4",
        "IsDefaultVersion": true,
        "CreateDate": "2023-11-16T23:07:06+00:00"
    }
}
```

This policy allows all `Describe`, `Get`, and `List` actions on Amazon GuardDuty.

Moving on to the next policy, `dev01`, I found that its current version was 7.

```sh
> aws iam get-policy-version --policy-arn arn:aws:iam::794929857501:policy/dev01 --version-id v7
{
    "PolicyVersion": {
        "Document": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "VisualEditor0",
                    "Effect": "Allow",
                    "Action": [
                        "iam:GetRole",
                        "iam:GetPolicyVersion",
                        "iam:GetPolicy",
                        "iam:ListPolicyVersions",
                        "iam:GetUserPolicy",
                        "iam:ListGroupsForUser",
                        "iam:ListAttachedUserPolicies",
                        "iam:ListUserPolicies",
                        "iam:GetUser",
                        "iam:ListAttachedRolePolicies",
                        "iam:GetRolePolicy"
                    ],
                    "Resource": [
                        "arn:aws:iam::794929857501:user/dev01",
                        "arn:aws:iam::794929857501:role/BackendDev",
                        "arn:aws:iam::794929857501:policy/BackendDevPolicy",
                        "arn:aws:iam::794929857501:policy/dev01",
                        "arn:aws:iam::aws:policy/AmazonGuardDutyReadOnlyAccess"
                    ]
                }
            ]
        },
        "VersionId": "v7",
        "IsDefaultVersion": true,
        "CreateDate": "2023-10-11T19:59:08+00:00"
    }
}
```

This policy allowed the actions on the user `dev01`, role `BackendDev` and policies `BackendDevPolicy`, `dev01` and `AmazonGuardDutyReadOnlyAccess`.

The `BackendDevPolicy` policy probably was associated with the `BackendDev` user. This can be verified using:

```sh
> aws iam list-attached-role-policies --role-name BackendDev
{
    "AttachedPolicies": [
        {
            "PolicyName": "BackendDevPolicy",
            "PolicyArn": "arn:aws:iam::794929857501:policy/BackendDevPolicy"
        }
    ]
}
```

I also found that the `BackendDev` role was made to allow the developers to assume it (as it had the `sts:AssumeRole` action), much like `sudo`.

```sh
> aws iam get-role --role-name BackendDev
{
    "Role": {
        "Path": "/",
        "RoleName": "BackendDev",
        "RoleId": "AROA3SFMDAPO2RZ36QVN6",
        "Arn": "arn:aws:iam::794929857501:role/BackendDev",
        "CreateDate": "2023-09-29T12:30:29+00:00",
        "AssumeRolePolicyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "AWS": "arn:aws:iam::794929857501:user/dev01"
                    },
                    "Action": "sts:AssumeRole"
                }
            ]
        },
        "Description": "Grant permissions to backend developers",
        "MaxSessionDuration": 3600,
        "RoleLastUsed": {
            "LastUsedDate": "2025-05-27T04:11:38+00:00",
            "Region": "us-east-1"
        }
    }
}
```

Then I checked the `BackendDevPolicy` policy.

```sh
> aws iam get-policy --policy-arn arn:aws:iam::794929857501:policy/BackendDevPolicy
{
    "Policy": {
        "PolicyName": "BackendDevPolicy",
        "PolicyId": "ANPA3SFMDAPO7OINIQIRR",
        "Arn": "arn:aws:iam::794929857501:policy/BackendDevPolicy",
        "Path": "/",
        "DefaultVersionId": "v1",
        "AttachmentCount": 1,
        "PermissionsBoundaryUsageCount": 0,
        "IsAttachable": true,
        "Description": "Policy defining permissions for backend developers",
        "CreateDate": "2023-09-29T12:44:09+00:00",
        "UpdateDate": "2023-09-29T12:44:09+00:00",
        "Tags": []
    }
}
```

The policy was running version 1 (`v1`). So I checked the JSON document using `get-policy-version` command.

```sh
> aws iam get-policy-version --policy-arn arn:aws:iam::794929857501:policy/BackendDevPolicy --version-id v1
{
    "PolicyVersion": {
        "Document": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "VisualEditor0",
                    "Effect": "Allow",
                    "Action": [
                        "ec2:DescribeInstances",
                        "secretsmanager:ListSecrets"
                    ],
                    "Resource": "*"
                },
                {
                    "Sid": "VisualEditor1",
                    "Effect": "Allow",
                    "Action": [
                        "secretsmanager:GetSecretValue",
                        "secretsmanager:DescribeSecret"
                    ],
                    "Resource": "arn:aws:secretsmanager:us-east-1:794929857501:secret:prod/Customers-QUhpZf"
                }
            ]
        },
        "VersionId": "v1",
        "IsDefaultVersion": true,
        "CreateDate": "2023-09-29T12:44:09+00:00"
    }
}
```

This revealed some interesting information. If I assumed the role, I could retrieve information about all EC2 instances and list all SecretsManager secrets. I could also retrieve information about and get secret values of the `prod/Customers-QUhpZf`.

Now, the final policy - `S3_Access`. I found that it would allow me to list and retrieve contents from the `hl-dev-artifacts` bucket.

```sh
> aws iam get-user-policy --user-name dev01 --policy-name S3_Access
{
    "UserName": "dev01",
    "PolicyName": "S3_Access",
    "PolicyDocument": {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "s3:ListBucket",
                    "s3:GetObject"
                ],
                "Resource": [
                    "arn:aws:s3:::hl-dev-artifacts",
                    "arn:aws:s3:::hl-dev-artifacts/*"
                ]
            }
        ]
    }
}
```

Summing up everything, I found that:

- using the Amazon managed policy, I could access Amazon GuardDuty
- using the customer managed policy, I could assume the role `BackendDev` and using its attached policy, I could list and retrieve information on secrets stored in Secrets Manager
- using the inline policy, I could list and retrieve objects stored in a S3 bucket.

To find the flag, I listed the objects stored in the S3 bucket.

```sh
> aws s3 ls s3://hl-dev-artifacts/
2023-10-01 16:39:53       1235 android-kotlin-extensions-tooling-232.9921.47.pom
2023-10-01 16:39:53     214036 android-project-system-gradle-models-232.9921.47-sources.jar
2023-10-01 16:38:05         32 flag.txt
```

And found it!

The next thing I did was find the secrets stored in the Secret Manager. To do so, first I had to assume the `BackendDev` role.

```sh
> aws sts assume-role --role-arn arn:aws:iam::794929857501:role/BackendDev --role-session-name MySession
```

This would give the access and secret keys, along with the session token. First, I configured aws cli with the access keys.

```sh
aws configure
```

Then I configured the session token.

```sh
aws configure set aws_session_token "<session-token>"
```

Doing so, I assumed the `BackendDev` role, which I confirmed using the `get-caller-identity` command.

Now I used the `ListSecrets` action to find the secrets stored in Secrets Manager.

```sh
> aws secretsmanager list-secrets
{
    "SecretList": [
        {
            "ARN": "arn:aws:secretsmanager:us-east-1:794929857501:secret:prod/Customers-QUhpZf",
            "Name": "prod/Customers",
            "Description": "Access to the MySQL prod database containing customer data",
            "LastChangedDate": "2023-09-29T08:37:58.584000-04:00",
            "LastAccessedDate": "2025-05-26T20:00:00-04:00",
            "Tags": [],
            "SecretVersionsToStages": {
                "bf175f57-7e29-4fd1-881f-76e78fdd7320": [
                    "AWSCURRENT"
                ]
            },
            "CreatedDate": "2023-09-29T08:37:58.328000-04:00"
        }
    ]
}
```

I could also retrieve the secrets. I found the MariaDB username and password stored in the secrets!

```sh
> aws secretsmanager get-secret-value --secret-id arn:aws:secretsmanager:us-east-1:794929857501:secret:prod/Customers-QUhpZf
{
    "ARN": "arn:aws:secretsmanager:us-east-1:794929857501:secret:prod/Customers-QUhpZf",
    "Name": "prod/Customers",
    "VersionId": "bf175f57-7e29-4fd1-881f-76e78fdd7320",
    "SecretString": "{\"username\":\"root\",\"password\":\"$DB$Admin12345\",\"engine\":\"mariadb\",\"host\":\"10.10.14.15\",\"port\":\"3306\",\"dbname\":\"customers\"}",
    "VersionStages": [
        "AWSCURRENT"
    ],
    "CreatedDate": "2023-09-29T08:37:58.579000-04:00"
}
```
