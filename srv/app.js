const fs = require("fs");
const https = require("https");
const http = require("http");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const cors = require("cors");
//const sphp = require("sphp");
const express = require("express");
const sessions = require("express-session");
const cookieParser = require("cookie-parser"); // Login Page

// To semd data to Telegram from nodejs
const ctrlTelegram = require('./api/telegramMsg');

const morgan = require("morgan"); // Logger
const chalk = require("chalk"); // Logger
const path = require("path");

const config = require("./config"); // Load config

// Connect Admin DB
const db = new sqlite3.Database("./admin.sqlite3", (err) => {
  if (err) console.log("Failed to connect DB", err);
  else console.log("Admin DB - Connected");
});

// Connect Users DB
const db_user = new sqlite3.Database("./user.sqlite3", (err) => {
  if (err) console.log("Failed to connect DB", err);
  else console.log("Users DB - Connected");
});

console.log(config.HOST_URL);

// Logger ...
const morganMiddleware = morgan(function (tokens, req, res) {
  if (!tokens.url(req, res).includes("assets")) // Delete if we whant show request of all (png,js,fonts)
  {
    return [
      "+---",
      "\n",
      chalk.hex("#f78fb3")("Date : " + tokens.date(req, res)), "\n",
      chalk.hex("#34ace0")("Method : " + tokens.method(req, res)), "\n",
      chalk.hex("#ffb142")("Status : " + tokens.status(req, res)), "\n",
      chalk.hex("#ff5252")("Url : " + tokens.url(req, res)), "\n",
      chalk.hex("#ff5252")("Session : " + req.sessionID), "\n",
      chalk.hex("#2ed573")("Resp. Time : " + tokens["response-time"](req, res) + " ms"), "\n",
      chalk.hex("#34eee0")("Addr : " + tokens["remote-addr"](req, res)), "\n",
      chalk.hex("#fffa65")("From : " + tokens.referrer(req, res)), "\n",
      chalk.hex("#1e90ff")("Agent : " + tokens["user-agent"](req, res)), "\n",
      chalk.hex("#2ed573")("SID : " + req.cookies["connect.sid"]),
      "\n",
    ].join(" ");
  };
});

// Create App
const app = express();

// View engine setup for Dashboard
app.set('view engine', 'ejs');

// Cors
app.use(
  cors({
    origin: [
      "https://xnail.shop",
      "https://www.xnail.shop",
      "http://localhost:3000",
    ],
  })
);

// Creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

// Session middleware
app.use(
  sessions({
    secret: "ThisIsMySessionKey",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);


// Parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// To put to databse
const currentDate = new Date();

var validation = {
  isNumber:function(str) {
      var pattern = /^\d+\.?\d*$/;
      return pattern.test(str);  // returns a boolean
  }
};   

// Create user ...
app.post("/register", async (req, res) => {

  console.log(
    chalk.red(">>> REGISTER : "),
    chalk.white(`${req.body.user}, ${req.body.mobile}\n`)
  );
  var formated = req.body.mobile.replace(/\+/g, "");
  if (validation.isNumber(formated)){   
  db_user.all(
    "SELECT * FROM user WHERE mobile = ?",
    [formated],
    (err, result) => {
      if (err) return res.redirect("/fail");
      else {
        if (result.length > 0)
          return res.redirect("/mobile");
        else {
          db_user.run(
            "INSERT INTO user (date, user, mobile) VALUES (?, ?, ?)",
            [currentDate.toLocaleString(), req.body.user, formated],
            (err) => {
              if (err) return res.redirect("/fail");
              else
                ctrlTelegram.sendMsg(req, res);
                ctrlCRM.sendCRM(req.body, res);
              return res.redirect("/thanks");
            }
          );
        }
      }
    }
  );
}
else {
  return res.redirect("/fail");
}
});

// Login ...
app.post("/login", (req, res) => {
  console.log(
    chalk.green(">>> ACCESS : "),
    chalk.white(`${req.body.username}, ${req.body.password}\n`)
  );
  db.all(
    "SELECT password FROM user WHERE admin = ?",
    [req.body.username],
    (err, result) => {
      if (err)
        return res.redirect("/fail");
      //return res.json({ authenticated: false, error: err });
      else {
        if (result.length === 0) {
          return res.redirect("/fail");
          //return res.json({authenticated: false, error: "DATA",});
        }
        const pwd = result[0].password;
        const authenticated = bcrypt.compareSync(req.body.password, pwd);
        if (authenticated) {
          session = req.session;
          session.userid = req.body.username;
          return res.redirect('/dashboard');
          // return res.json({ authenticated: true });
        }
        return res.redirect("/fail");
        //return res.json({authenticated: false, error: "FAIL",});
      }
    }
  );
});


// Logout ...
app.get("/logout", (req, res) => {
  req.session.destroy();
  //res.json({ success: true });
  res.redirect("/");
});

// A Variable to save a Session
var session;

// Login - END

// Logger ...
app.use(morganMiddleware);

// https://www.section.io/engineering-education/what-are-cookies-nodejs/
// https://www.section.io/engineering-education/session-management-in-nodejs-using-expressjs-and-express-session/
app.use(cookieParser()); // Login Page

// Redirect all to HTTPS
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  if (process.env.NODE_ENV === "production") {
    // Production mode
    if (req.secure) {
      // if secure
      return next();
    } else {
      // if not secure
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
  } else {
    // Development mode
    return next();
  }
});

// Redirect all to non-www
app.get('/*', function (req, res, next) {
  if (req.headers.host.match(/^www/) !== null) {
    res.redirect('http://' + req.headers.host.replace(/^www\./, '') + req.url);
  } else {
    return next();
  }
})

// Serve PHP
// app.use(sphp.express(path.join(__dirname, "public/")));

// Serve static folder 'public'
app.use(express.static(path.join(__dirname, "public/")));

// Dashboard ...
app.get('/dashboard', (req, res) => {
  if (req.session.userid) {
    db_user.all(
      "SELECT * FROM user LIMIT 100",
      (err, result) => {
        if (err)
          return res.redirect("/fail");
        else {
          if (result.length === 0) {
            return res.redirect("/null");
          }
          if (result.length) {
            res.render('dashboard', { userData: result });
          }
        }
      }
    );

  } else {
    res.redirect("/fail");
  }
});

// Delete ...
app.get('/delete', (req, res) => {
  if (req.session.userid) {
    console.log(
      chalk.red(">>> DELETE : "),
      chalk.white(`${req.query.mobile}\n`)
    );
    db_user.all(
      "DELETE FROM USER WHERE mobile = ?",
      [req.query.mobile],
      (err, result) => {
        if (err) {
          console.log(err, result);
          return res.redirect("/fail");
        }
        else {
          return res.redirect(req.get('referer'));
        }
      }
    );
  }
  else {
    return res.redirect("/auth");
  }
});

// Null ...
app.get('/null', (req, res) => {
  if (req.accepts("html")) {
    res.render("message", { status: "ВНИМАНИЕ", alert: "alert-info", message: "Нет Клиентов!" });
    return;
  }
});

// Thanks ...
app.get('/thanks', (req, res) => {
  if (req.accepts("html")) {
    res.render("message", { status: "СПАСИБО", alert: "alert-success", message: "Ваша заявка отправлена!" });
    return;
  }
});

// Mobile ...
app.get('/mobile', (req, res) => {
  if (req.accepts("html")) {
    res.render("message", { status: "ВНИМАНИЕ", alert: "alert-info", message: "Пользователь уже зарегистрирован!" });
    return;
  }
});

// Mobile ...
app.get('/auth', (req, res) => {
  if (req.accepts("html")) {
    res.render("message", { status: "ВНИМАНИЕ", alert: "alert-danger", message: "Ошибка авторизации!" });
    return;
  }
});

// Recover ...
app.get('/recover', (req, res) => {
  if (req.accepts("html")) {
    res.render("recover");
    return;
  }
});

// About ...
app.get('/about', (req, res) => {
  if (req.accepts("html")) {
    res.render("about");
    return;
  }
});

// Job ...
app.get('/job', (req, res) => {
  if (req.accepts("html")) {
    res.render("job");
    return;
  }
});

// Office ...
app.get('/office', (req, res) => {
  if (req.accepts("html")) {
    res.render("office");
    return;
  }
});

// Terms ...
app.get('/terms', (req, res) => {
  if (req.accepts("html")) {
    res.render("terms");
    return;
  }
});

// Feedback ...
app.get('/feedback', (req, res) => {
  if (req.accepts("html")) {
    res.render("feedback");
    return;
  }
});

// FAIL ...
app.get('/fail', (req, res) => {
  if (req.accepts("html")) {
    res.render("message", { status: "ВНИМАНИЕ", alert: "alert-danger", message: "Произошла ошибка на сервере!" });
    return;
  }
});

// Return 404.html page for unregisterd url
app.use((req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.render("message", { status: "ВНИМАНИЕ", alert: "alert-info", message: "Страница не найдена!" });
    return;
  }
});

// Listen both http & https ports
const httpsServer = https.createServer(
  {
    key: fs.readFileSync(`${config.KEY_DIR}/privkey.pem`),
    cert: fs.readFileSync(`${config.KEY_DIR}/fullchain.pem`),
  },
  app
);

// Start HTTP server
const httpServer = http.createServer(app);

httpServer.listen(config.HTTP_PORT, () => {
  console.log(`HTTP Server running on port ${config.HTTP_PORT}`);
});

// Start HTTP's Server
httpsServer.listen(config.HTTPS_PORT, () => {
  console.log(`HTTPS Server running on port ${config.HTTPS_PORT}`);
}); 