{\rtf1\ansi\ansicpg1252\cocoartf2820
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 HelveticaNeue;}
{\colortbl;\red255\green255\blue255;\red255\green255\blue255;}
{\*\expandedcolortbl;;\cssrgb\c100000\c100000\c100000;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx560\tx1120\tx1680\tx2240\tx2800\tx3360\tx3920\tx4480\tx5040\tx5600\tx6160\tx6720\sl-360\pardirnatural\partightenfactor0

\f0\fs30 \cf2 import http from "k6/http";\
import \{ check, sleep \} from "k6";\
const isAppStart = () => \{\
  const options = \{\
    vus: 1, // 100 users \uc0\u273 \u7891 ng th\u7901 i\
    duration: "1s", // Ch\uc0\u7841 y trong 30 gi\'e2y\
  \};\
  const url = "{\field{\*\fldinst{HYPERLINK "http://localhost:3000/"}}{\fldrslt \ul \ulc2 http://localhost:3000/}}";\
  const payload = JSON.stringify(\{\});\
\
  const params = \{\
    headers: \{\
      "Content-Type": "application/json",\
    \},\
  \};\
\
  const res = http.get(url, payload, params);\
\
  sleep(1);\
\
  return JSON.parse(res.body).statusCode === 200;\
\};\
export const options = \{\
  vus: 1, // 100 users \uc0\u273 \u7891 ng th\u7901 i\
\};\
\
const login = (n = 5) => \{\
  const emailList = Array.from(\{ length: n \}, (_, i) => `test$\{i\}@gmail.com`);\
\
  const url = "{\field{\*\fldinst{HYPERLINK "http://localhost:3000/auth/login"}}{\fldrslt \ul \ulc2 http://localhost:3000/auth/login}}";\
  const params = \{\
    headers: \{\
      "Content-Type": "application/json",\
    \},\
  \};\
  const rs = [];\
  emailList.forEach((e) => \{\
    const payload = JSON.stringify(\{\
      email: e,\
      password: "123",\
    \});\
\
    const res = {\field{\*\fldinst{HYPERLINK "http://http.post"}}{\fldrslt \ul \ulc2 http.post}}(url, payload, params);\
    const parsedRes = JSON.parse(res.body);\
    rs.push(parsedRes.data.accessToken);\
  \});\
\
  return rs;\
\};\
\
const buy = (tokenList) => \{\
  const url = "{\field{\*\fldinst{HYPERLINK "http://localhost:3000/order/"}}{\fldrslt \ul \ulc2 http://localhost:3000/order/}}";\
  const url1 = "{\field{\*\fldinst{HYPERLINK "http://localhost:3000/payment/test/procress"}}{\fldrslt \ul \ulc2 http://localhost:3000/payment/test/procress}}";\
\
  const rs = [];\
  tokenList.forEach((token) => \{\
    const payload = JSON.stringify(\{\
      eventId: "testEvent1",\
      orderDetails: [\
        \{\
          ticketClassId: "tc1",\
          quantity: "2",\
        \},\
      ],\
      returnUrl: "string",\
      paymentGateway: "zalopay",\
    \});\
    sleep(1);\
    const res = {\field{\*\fldinst{HYPERLINK "http://http.post"}}{\fldrslt \ul \ulc2 http.post}}(url, payload, \{\
      headers: \{\
        "Content-Type": "application/json",\
        Authorization: `Bearer $\{token\}`,\
      \},\
    \});\
\
    const json = JSON.parse(res.body);\
\
    const code = json.data.orderData.code;\
    if (json.statusCode !== 200) \{\
      console.log("Can not buy ticket");\
    \} else \{\
      rs.push(code);\
    \}\
\
    check(res, \{\
      "buy success": (r) => \{\
        console.log("Code", code);\
        return r.status === 200;\
      \},\
    \});\
  \});\
\
  return rs;\
\};\
\
const addToQueue = (codeList) => \{\
  const url1 = "{\field{\*\fldinst{HYPERLINK "http://localhost:3000/payment/test/procress"}}{\fldrslt \ul \ulc2 http://localhost:3000/payment/test/procress}}";\
  const params = \{\
    headers: \{\
      "Content-Type": "application/json",\
    \},\
  \};\
\
  codeList.forEach((code) => \{\
    const processRes = {\field{\*\fldinst{HYPERLINK "http://http.post"}}{\fldrslt \ul \ulc2 http.post}}(\
      url1,\
      JSON.stringify(\{\
        code,\
      \}),\
      \{\
        headers: \{\
          "Content-Type": "application/json",\
        \},\
      \}\
    );\
    check(processRes, \{\
      "processQueue success": (r) => \{\
        console.log("Code", code);\
        return r.status === 200;\
      \},\
    \});\
  \});\
\};\
\
export default function () \{\
  if (!isAppStart()) \{\
    console.log("App is not start");\
  \} else \{\
    const toeknList = login(1);\
    const a = buy(toeknList);\
    addToQueue(a);\
  \}\
\}\
}