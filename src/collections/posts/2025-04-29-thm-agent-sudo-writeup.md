---
layout: blog
title: TryHackMe Agent Sudo Writeup
publishDate: 2023-12-04T11:24:00.000Z
description: Walk-through of TryHackMe Agent Sudo CTF room.
tags:
  - tryhackme
  - writeup
---
This TryHackMe CTF room has 5 tasks. The first one is just a simple note from the author of the room.

## Task 2

In order to find the open ports, I ran a simple TCP SYN scan using nmap. Three open ports were found.

| Port | Service |
| ---- | ------- |
| 21   | ftp     |
| 22   | ssh     |
| 80   | http    |

I used gobuster to enumerate the website but couldn't find any interesting page. On visiting the website at http://TARGET_IP/index.php, a message was shown asking to change the user-agent to my "codename". The message was from some "Agent R", so I figured R must be his/her codename. 

To change the user-agent in firefox, visit about:config page and create a rule `general.useragent.override` and set the string value to 'R'.

On refreshing the page, I found out that there were 25 employees and R must be one of them. So, it was possible that the codenames were alphabets. This meant that I could change the alphabet to find my codename. And yes, it worked.

## Task 3

From the page, I got the username, using which I could find the password of the ftp using hydra.

```sh
hydra -l USERNAME -P rockyou.txt ftp://TARGET_IP
```

![](/images/uploads/pasted-image-20231204012723.png)

Logging in to the ftp server, I found three files which I downloaded.

![](/images/uploads/pasted-image-20231204014531.png)

Stegseek came in handy to find the hidden message in one of the images.

```sh
stegseek <IMAGE_FILE>
```

![](/images/uploads/pasted-image-20231204015700.png)

The extracted file (cute-alien.jpg.out) contained the real name of the other agent and the ssh password.

Using binwalk, I found out that it contained a zipped file embedded in it.

![](/images/uploads/pasted-image-20231204015938.png)

I extracted the zip file using the command:

```sh
binwalk -e <IMAGE_FILE>
```

The zip file was extracted, but it was encrypted. So, I converted it into a hash using zip2john and used john the ripper to crack the hash.

```sh
zip2john 8722.zip > hash

john hash
```

![](/images/uploads/pasted-image-20231204021337.png)

## Task 4

Using these credentials, I got access through ssh. Two files were there in the home directory, one of them was the required user.txt file containing the user flag. The other was an image which I downloaded using scp:

```sh
scp james@TARGET_IP:~/Alien_autospy.jpg ./
```

The image can be reverse image searched on Google to find the answer about the incident.

## Task 5

I logged back into the remote using ssh and checked the user permissions.

![](/images/uploads/pasted-image-20231204023958.png)

The user john was not allowed to run bash as root. I googled for an exploit and found a CVE. That's it, a single command gave me root access and I got the root flag in /root directory.

![](/images/uploads/pasted-image-20231204024153.png)
