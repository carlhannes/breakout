# breakout
Force rebooting a router, gateway, repeater or likewise

## Installation & usage
Make sure you have a recent version of NodeJS installed on your computer.
Clone the repository to your computer
Open your terminal/command prompt and use `npm install` to install required packages
Copy `config.example.yml` to `config.yml` and edit it to suit your needs
IMPORTANT: Do NOT forget to add 'username' (if applicable) and 'password' in the config,
if these are incorrect the router may ask for captchas, see troubleshooting below.
Run the script by executing `npm run start` in your terminal/command prompt.

## Supported devices/Software
* Telia router(s) (Sagecom F@st 5370e)
* Most ASUS routers (Tested on Asus RT-AC86U, but ASUS WRT is very standardized)

## Troubleshooting
If the script does not work as intended, it could be for many different reasons.
Maybe your router isn't supported? If that is the case, feel free to contribute!
To debug you can add `NODE_ENV: development` to your config.yml file 
and run the script again.

0. Gets stuck on Login page
  Maybe your device is not supported, OR there is a captcha that needs to be solved
  to login. If that's the case, double check your username & password in config.yml
  and then login using the same credentials in your router from your own browser,
  while solving the captcha. If there's a successful login the router usually
  stops asking for captchas, but will start again if there's a failed login.


