import axios from 'axios';
let data = JSON.stringify({
  "email": "testadd.user@aduser.com",
  "password": "Auth0Dem0!"
});
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'http://localhost:8080/api/login',
  headers: { 
    'Content-Type': 'application/json', 
    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1EVTVOemRGT1RrM1FVUTNPVE0zTlVNNE5qZEVORUkwTkRZNU5USXlNamRFUlRZM1JrVXhOQSJ9.eyJpc3MiOiJodHRwczovL29pZGMtdGVzdHMuYXV0aDAuY29tLyIsInN1YiI6Im85TlBwaExVTWlIWGZ3dVhscGw2U1AzcEdYbmdYamZEQGNsaWVudHMiLCJhdWQiOiJodHRwczovL2xkYXAuZGVzbWF4aW11cy5jb20vYXBpIiwiaWF0IjoxNjk3NzQ5NzM5LCJleHAiOjE2OTc4MzYxMzksImF6cCI6Im85TlBwaExVTWlIWGZ3dVhscGw2U1AzcEdYbmdYamZEIiwic2NvcGUiOiJkZWxldGU6dXNlcnMgY3JlYXRlOnVzZXJzIGNoYW5nZTpwYXNzd29yZCBhdXRoZW50aWNhdGU6dXNlcnMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.jN--OwtWMcDpa0lZQTDKlQfAHnhH7USb0qqfHfx7YKH87LO5P_Wg6OfdPNHlwPqNHY0EQizbFGbzx16goFz2GulZbkgdLXGiFTjWySEgFP2DbjdpJQGWT8sl5Osbvurpk4Rj6ycfc-A_f2ri_HyCir27LXXngEyCYA-VWyu89BJ1JQNpM-yTFh4bpXFbpM1naMGFCz_okQiSggCWcxHquRTvzldNOV3vh4-unr3SUzeNGCwlf-OAnSR03-HB5MGSd9Rv_kzsxgltjI94Pp_VkIDtFtXUv2rKZCk8ik8e0kwmj2tFwDUJGsPpJekRdlz5GjhJkkw_MZcwke6lmrqoyw'
  },
  data : data
};

for (let index = 0; index < 12; index++) {
        //await sleep(100); 
        axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });

   
}


