#!/bin/bash
INTERFACE=$(lshw -C network -json | jq -r '.[] | select(.configuration.driver=="rtl8821au") | .logicalname')
SSID=tj-kareoke
if [ -z "$INTERFACE" ]; then
    echo "No RTL8821AU interface found. Please ensure the adapter is connected."
    exit 1
fi


sudo apt update
sudo apt install hostapd dnsmasq iptables -y
sudo sed "s/<interface>/$INTERFACE/g" dnsmasq.conf.template | sudo tee /etc/dnsmasq.conf
sudo sed "s/<interface>/$INTERFACE/g" hostapd.conf.template | sudo sed "s/<ssid>/$SSID/g" | sudo tee /etc/hostapd/hostapd.conf
# sudo echo $HAPD_CONF > /etc/hostapd/hostapd.conf
# sudo cp /etc/sysctl.conf /etc/sysctl.conf.bak
# sudo cat /etc/sysctl.conf | sed "s/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/" > /etc/sysctl.conf
# sudo sysctl -p /etc/sysctl.conf
# sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
# sudo iptables -A FORWARD -i eth0 -o $INTERFACE -j ACCEPT
sudo systemctl unmask hostapd
sudo systemctl enable hostapd
sudo systemctl restart hostapd
sleep 3
sudo systemctl enable dnsmasq
sudo systemctl restart dnsmasq
sleep 3
sudo ifconfig $INTERFACE 192.168.4.1 netmask 255.255.255.0 up
echo "Network setup complete. You can now connect to the Wi-Fi network with SSID: $SSID"