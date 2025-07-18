#!/bin/bash
sudo apt update
sudo apt install hostapd dnsmasq iptables git -y
git clone https://github.com/morrownr/8821au-20210708.git
cd 8821au-20210708
sudo ./install-driver.sh
