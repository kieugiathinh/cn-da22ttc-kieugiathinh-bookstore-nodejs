// import jwt from "jsonwebtoken";

// const generateToken = (res, userId) => {
//   const token = jwt.sign({ userId }, process.env.JWT_SEC, {
//     expiresIn: "30d",
//   });

//   res.cookie("jwt", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV !== "development",
//     sameSite: "strict",
//     maxAge: 30 * 24 * 60 * 60 * 1000,
//   });
// };

// export default generateToken;
import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SEC, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    httpOnly: true, // Chống XSS

    // Ở localhost (HTTP) thì secure phải là false.
    // Khi deploy (HTTPS) thì secure là true.
    secure: process.env.NODE_ENV !== "development",

    // QUAN TRỌNG: Đổi từ 'strict' sang 'lax'
    // 'lax': Cho phép gửi cookie khi người dùng điều hướng từ trang web khác (như Stripe) trở về web mình.
    // 'strict': Chặn cookie nếu nguồn không phải từ chính web mình -> Mất đăng nhập khi thanh toán xong.
    sameSite: "lax",

    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
  });
};

export default generateToken;
