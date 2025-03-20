# safe-tx-hashes-ui

![Screenshot 2025-03-07 at 17 47 31](https://github.com/user-attachments/assets/ae863272-c106-4b05-a474-44460f4be199)

A simple tool for offline generation of Safe tx hashes

> [!WARNING]  
> This repository contains a copy of `ethers.umd.min.js`  
> The code was taken from the official `ehters.js` v6 repo ([permalink](https://github.com/ethers-io/ethers.js/blob/ce7212d03d6867081603794f0480f31d053823c4/dist/ethers.umd.min.js)) and is used in index.html inside a `<script>` tag  
> The decision was made to use this ethers file as is, but the validation is required, see the "App validation" section below 


## Validated hashes and links 
> [!IMPORTANT]  
> Use this hashes to compare to the ones we get from terminal or online tools for `index.html` and the `ethers.js` code inside the `<script>` tag

- `index.html` sha-384 (base-64) => `29B4WUxNSuolRD1yoPcBDJvpA3mfNOfJUotsoB5BzR0ov4uKCERUOaAl/8all6Jk`
- Ethers code from the `<script>` tag sha-384 (base-64) => `NRAZj94DQk3dgtsOZzVYHbYVV1DFkF5QhL5RRxF0ILZLi6OQ7CsMlun748D42JbO`  
- IPFS link => TBA
- `ethers.umd.min.js` raw file link => https://raw.githubusercontent.com/ethers-io/ethers.js/ce7212d03d6867081603794f0480f31d053823c4/dist/ethers.umd.min.js


## Usage

1. Clone the repo

2. Open `index.html` file in your browser

3. Enter the tx details into the form

4. Press "Generate hashes" button to generate hashes

5. Compare generated hashes with ones in your hardware wallet

## App validation

For this app to be used with IPFS, we prepared a standalone index.html file including the `ethers.umd.min.js` code from
the [official repo](https://github.com/ethers-io/ethers.js/blob/ce7212d03d6867081603794f0480f31d053823c4/dist/ethers.umd.min.js)

As we take the external file code from the Ethers repo and use it as is, we need to be sure nor the IPFS version of index.html file or the ethers code inside the `<script>` tag were modified.


### Instructions for obtaining SHA-384 for ethers.js/index.html
Why needs SHA-384
Under the mechanism of Subresource Integrity (SRI), a hash (for instance, sha384) is used in the integrity attribute of a `<script>` tag (relevant for external scripts). When the browser loads the script, it checks the file’s integrity by comparing the computed hash to the one specified in the attribute. This prevents the script from being replaced by a malicious version.

In this project, the integrity will only be used to verify that the files have not been modified.

### How to get the hash via terminal

As we use standalone `index.html` file for uploading to IPFS we need to check separately whether the ethers code inside the `<script>` tag and the `index.html` file itself are not modified.

1. Make sure OpenSSL is installed on your system.
2. In the root directory of the app create an empty `ethers.js` file
3. Copy the code containing in the `<script>` tag on the line #175 and paste it into the empty `ethers.js` file.
4. Run the following command to calculate SHA-384 for the ethers.js (example for Unix-like systems):  
`openssl dgst -sha384 -binary ethers.js | openssl base64 -A && echo`
5. Now we can compare the hash we got from terminal to the one we have in the "Validated hash" section above. 
6. Additionally, we can download the ethers [file from the official Ethers repo](https://github.com/ethers-io/ethers.js/blob/ce7212d03d6867081603794f0480f31d053823c4/dist/ethers.umd.min.js).  
Navigate to the downloaded file directory and run the command `openssl dgst -sha384 -binary ethers.umd.min.js | openssl base64 -A && echo`  
Now we can compare the hash we got from the terminal and the one we got from the `ethers.js` as well as with the one described in the "Validated hash" section.
7. Next we need to validate the `index.html` file we got from IPFS the same way, just download the source code of the page and follow the above steps replacing `ethers.js` with the html file name.


### How to get the hash via Online tool. 

We can use [this tool](https://emn178.github.io/online-tools/sha384_file_hash.html), or similar ones calculating the hash of a file from local using SHA384 to compare hashes. 

We just need to prepare files (local `ethers.js` file containing the code from the `<script>` tag, html file, (or IPFS link) got from IPFS) and compare hashes to the one described in the 'Validated hashes' section.  

The entire validation process comes to comparing the computed values with the one indicated in the "Validated hash" section.

If the values match, the file has not been altered.



