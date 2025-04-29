---
layout: blog
title: THM Simple CTF Writeup
publishDate: 2023-12-02T23:51:00.000Z
description: Walkthrough/answers of TryHackMe Simple CTF room.
tags:
  - tryhackme
  - writeup
---
**1. How many services are running under port 1000?**  

```sh
nmap -sV --script vuln 10.10.122.179 -vv
```

**2. What is running on the higher port?**  
Check which service is running on the highest port (in this case, it is port 2222)

**3. What's the CVE you're using against the application?**  
List all directories using gobuster to find the path `/simple`. On visiting the page, it was found that the website use a CMS service call "CMS Made Simple", version 2.2.8.

Searching for exploits using `searchsploit` showed that there is a SQLi vulnerability on all versions <2.2.10 - CVE-2019-9053.

![](/images/uploads/screenshot-2025-03-21-235251.png)

**4. To what kind of vulnerability is the application vulnerable?**  
SQLi

**5. What's the password?**  
Download the exploitation script from exploitDB. But the script is in Python 2. So, we have to create a `virtualenv` to use python2 (better to use virtual env than installing and running python2 system wide).

```sh
virtualenv /usr/bin/python2 mydir
source mydir/
```

Run the downloaded script:

```sh
python exploit.py -u http://TARGET_IP/simple --crack -w /usr/share/wordlists/rockyou.txt
```

![](/images/uploads/screenshot-2025-03-21-235257.png)

**6. Where can you login with the details obtained?**  
ssh

**7. What's the user flag?**  
As we already know, we have an open port 2222 running ssh. Using the credentials revealed in last step, we can get remote access.

![](/images/uploads/screenshot-2025-03-21-235305.png)

**8. Is there any other user in the home directory? What's its name?**  
Just cd into home directory to reveal the other user.

**9. What can you leverage to spawn a privileged shell?**  

![](/images/uploads/screenshot-2025-03-21-235316.png)

*84ck_783_914n37*
