require("dotenv").config(); // for .env file
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");

const app = express();
// this line should be after "const app = express();"
// use a "public" folder for your css files and images
// change the paths of css file and images according to the public folder
app.use(express.static("public"));
// const https = require("https");
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000.");
});
// here we are getting the signup html page
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function (req, res) {
  // getting the information from the form here and saving in variables
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const eMail = req.body.Email;
  // creating a data object to send data to mailchimp data(data which we get from the form) server
  // https://mailchimp.com/developer/marketing/api/landing-pages-content/
  const data = {
    members: [
      {
        email_address: eMail,
        status: "subscribed",
        merge_fields: {
          // "FNAME" & "LNAME" these object we get from the merge field option in mailchimp website
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };
  // passing the information about the method and the authentication key to the https request
  const option = {
    method: "POST",
    // this authentication part consist of 2 part first is "sourabh" we can name this whatever we want
    // the 2nd part after the ":" api key
    auth: process.env.MAILCHIMP_API_KEY,
  };
  // this api url we get from the mailchimp api
  const url = process.env.MAILCHIMP_LIST_URL;
  //converting the data which we are sending inti JSON form
  var JSON_Data = JSON.stringify(data);
  // here we are getting the response from the mailchimp server
  const request = https.request(url, option, function (response) {
    // checking the response statusCode for any errors and according to that we will send the success or failure page.
    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
    //converting the response we are getting from the mailchimp servers into JSON
    response.on("data", function (data) {
      // loging out the response in JSON form
      console.log(JSON.parse(data));
    });
  });
  // sending data to the mailchimp server
  request.write(JSON_Data);
  // end the request
  request.end();
});
// redirecting the failure page to the sign in page
app.post("/failure", function (req, res) {
  res.redirect("/");
});
