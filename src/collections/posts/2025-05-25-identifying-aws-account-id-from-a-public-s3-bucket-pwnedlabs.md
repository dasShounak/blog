---
layout: blog
title: Identifying AWS Account ID from a public S3 bucket - PwnedLabs
publishDate: 2025-05-26T01:19:00.000Z
description: A quick walk-through for finding AWS Account IDs from public AWS S3 buckets.
tags:
  - pwnedlabs
  - writeup
  - aws
---
This lab provided an IP address on which a website was hosted. The challenge was to find the link to a publicly disclosed AWS S3 bucket, and then find the AWS Account ID which owns the bucket.

First of all, I ran a nmap scan to identify the open ports and running services. I found that only the TCP port 80 was open and a webserver was running on it. I opened the website in my browser to view the website.

![Website landing page](/images/uploads/pasted-image-20250525223954.png)

I needed to find the S3 bucket somewhere hidden in this website. Since S3 is a storage service, I suspected that some web assets might be loaded from the S3 bucket. So I checked the source code of the homepage, and found that some of the images were stored in the S3 bucket just as I thought.

![AWS S3 bucket hyperlinks in source code](/images/uploads/pasted-image-20250525224349.png)

So the name of the S3 bucket was *mega-big-tech*. AWS account IDs are a 12-digit number, and many account IDs are included in the ARN (Amazon Resource Number). So they are not necessarily private. And since its just a 12-digit number, its easy to brute force. I used a tool `s3-account-search` which is also available as a Python pip package. Check out the blog linked in the [GitHub repository](https://github.com/WeAreCloudar/s3-account-search) to understand how the script works.

To use this tool, you would need two things, a S3 bucket name (mega-big-tech) and the ARN of the role which should have the `s3:ListObject` and `s3:GetObject` permissions (to learn more about it, read the blog I mentioned earlier). The lab already has a role created with these permissions, so just find the role and copy it.

```sh
s3-account-search arn:aws:iam::427648302155:role/LeakyBucket mega-big-tech
```

![Finding AWS Account ID using the s3-account-search script](/images/uploads/pasted-image-20250526011433.png)

That's it. The account ID is **107513503799**. You can even find a public EC2 snapshot owned by this user. That's crazy.

![AWS EC2 public snapshots](/images/uploads/screenshot-2025-05-25-000546.png)

Now for the additional challenge, they asked to find a AWS CLI command to list public EBS snapshots, *i.e.* the same thing above but through a CLI command.

A quick google search can help you with this.

```sh
aws ec2 describe-snapshots --owner <account-id> --region <aws-region>
```

To find the aws region, you can use curl to show the http headers.

```sh
curl -I http://mega-big-tech.s3.amazonaws.com/
```

Done!
Thanks for reading.
