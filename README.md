# 🤖 turing-pi-js
> A JavaScript client for Turing Pi web API

## ℹ️ Overview

### 📦 Prerequisites
- [Node.js](https://nodejs.org/en)
- [Turing Pi 2](https://turingpi.com/product/turing-pi-2/)

This project is maintained by @PhearZero and is not associated with @turing-machines.
This library is used to control a `Turing Pi 2` from a JavaScript environment.

## ⚙️ Getting started

### Install
```bash
npm -i turing-pi-js --save
```

### Import
```javascript
import {tpi} from 'turing-pi-js'
const BMC_API = '<Add-URL-to-BMC-API>'
const client = tpi(BMC_API)
```

### Example Usage
```javascript
// Get current power state for all Nodes
client.get('power').then(r=>console.log(r))
// Power On Node 1
client.set('power',{node1:1}).then(r=>console.log(r))
```
[Find out more in the detailed usage](#-usage)

## 💾 Firmware

The current firmware, as of writing ([v1.0.1](https://github.com/wenyi0421/turing-pi), [v0.1.0-ce](https://github.com/daniel-kukiela/turing-pi-2-community-edition-firmware)), 
does not support Cross Origin Requests and requires a reverse proxy to connect from another machine. This library will 
work without a proxy when deployed locally on the [Turing Pi Web Server](https://help.turingpi.com/hc/en-us/articles/8849365259933-BMC-Web-Interface)

#### 🔃 Reverse Proxy

Temporary fix until the firmware api becomes more stable. This template patches the response headers for using the library
in the browser. The `ENV` variable for the [Turing Pi BMC API](https://help.turingpi.com/hc/en-us/articles/8795098568477-BMC-API) is `BMC_API` in following template:  

```nginx
#/etc/nginx/templates/default.conf.template
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;
    
    location /api/bmc {
        proxy_pass   ${BMC_API};
        proxy_hide_header Content-Type;
        add_header Content-Type application/json;
        add_header Access-Control-Allow-Origin *;
    }
}
```
## 📗 Usage

### ✨ Create client
```javascript
import {tpi} from 'turing-pi-js'
const BMC_API = '<Add-URL-to-BMC-API>'
const client = tpi(BMC_API)
```

### 🔧 Fetch Options
```javascript
client.get('nodeinfo', {
    credentials: true,
})
```

### 🔌 Power
```javascript
// Valid values are "0" or "1". "0" for OFF, "1" for ON.

// Get Power for all Nodes
client.get('power').then(r=>console.log(r))

// Set Power for any number of Nodes
client.set('power', {node1: 1, node2: 0, /* node3:0, node4:0 */}).then(r=>console.log(r))
```

### ⌨️ USB
```javascript
// mode: Valid values are "0" or "1". "0" for Host, "1" for Device
// node: Valid values are "0", "1", "2", "3". Relating to slots Node1-4

// Get USB state from BMC
client.get('usb').then(r=>console.log(r))

// Set Power for any number of Nodes
client.set('usb', {mode: 0, node: 0}).then(r=>console.log(r))
```

### ℹ️ Node Info
```javascript
// Get Node Info
client.get('nodeinfo').then(r=>console.log(r))
```
### ℹ️ BMC Info
```javascript
// Get BMC Info
client.get('other').then(r=>console.log(r))
```

### 📂 SD Card Info
```javascript
// Get SD card info
client.get('sdcard').then(r=>console.log(r))
```

### 🔃 Reset Network
```javascript
// Reset network
client.set('network', {cmd: "reset"}).then(r=>console.log(r))
```

### 💾 Update Firmware
```javascript
// Get the file contents
var input = document.querySelector('input[type="file"]')
// Upload firmware
client.set('firmware', {file: input.files[0]}).then(r=>console.log(r))
```
