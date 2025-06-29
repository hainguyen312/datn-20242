const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
var User = require('../models/user.model');
const gmailService = require('../services/gmail.service');
const streamServer = require('../stream');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const handleLogin = async (req, res) => {
    const identifier = req.body.identifier;
    const password = req.body.password;

    console.log("Website login");

    let existingUser = null;
    if (EMAIL_REGEX.test(identifier)) {
        existingUser = await User.findOne({ email: identifier });
    }
    else {
        existingUser = await User.findOne({ username: identifier });
    }
    if (!existingUser) {
        res.status(400).json("User not found");
    }
    else {
        try {
            const correctPassword = await bcrypt.compare(password, existingUser.password);
            if (correctPassword) {
                // create JWTs
                const accessToken = JWT.sign(
                    {
                        "UserInfo": {
                            "username": existingUser.username,
                            "userId": existingUser._id,
                            "email": existingUser.email,
                            "fullname": existingUser.fullname,
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '8h' }
                );
                const refreshToken = JWT.sign(
                    {
                        "UserInfo": {
                            "username": existingUser.username,
                            "userId": existingUser._id,
                            "email": existingUser.email,
                            "fullname": existingUser.fullname
                        }
                    },
                    process.env.REFRESH_TOKEN_SECRET,
                    { expiresIn: '7d' }
                );

                // Saving refreshToken with current user
                try {
                    existingUser.refreshToken = refreshToken;
                    await existingUser.save();
                } catch (error) {
                    console.log("Error saving refreshToken to DB");
                    console.log(error);
                }

                // send refresh token as http cookie, last for 1d
                res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'Strict', secure: true, maxAge: 24 * 60 * 60 * 1000 });

                // get user's stream token
                const streamToken = await streamServer.createToken(existingUser.username);

                console.log("Login successful");

                res.status(200).json({
                    accessToken: accessToken,
                    fullname: existingUser.fullname,
                    userId: existingUser._id,
                    email: existingUser.email,
                    username: existingUser.username,
                    image: existingUser.image || `https://getstream.io/random_png/?name=${existingUser.username}`,
                    isFirstLogin: existingUser.isFirstLogin,
                    streamToken: streamToken
                });
            }
            else {
                res.status(400).json("Wrong Password");
            }
        } catch (error) {
            console.log(error);
            res.status(500).json("Error Authenticating User");
        }
    }
}

const handleForget = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(409).json('Invalid email address');
        }

        const user = await User.findOne({ email: email });
        if (!user)
            return res.status(409).json('Email not registered');

        const token = JWT.sign({ email, username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        const resetPasswordUrl = `https://datn-20242-1.onrender.com/recover?token=${token}`;

        await gmailService.sendRecoverEmail(email, user.username, resetPasswordUrl);

        return res.sendStatus(200);
    } catch (error) {
        console.error('Error processing forget password request:', error);
        return res.sendStatus(500);
    }
};

const handleRecover = async (req, res) => {
    try {
        const { password, username } = req.body;

        const user = await User.findOne({ username: username });
        if (!user)
            return res.sendStatus(500);

        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                console.log(err);
                return res.sendStatus(500);
            }

            bcrypt.hash(password, salt, (err, hashedPassword) => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(500);
                }
                else {
                    user.password = hashedPassword;
                    user.save()
                        .then(() => {
                            return res.sendStatus(200);
                        })
                        .catch(err => {
                            console.log(err);
                            return res.sendStatus(500);
                        });
                }
            });
        });
    } catch (error) {
        console.error('Error processing forget password request:', error);
        return res.sendStatus(500);
    }
};

const handleVerifyToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(500).json('Internal server error');
        }

        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) {
                    console.log(err);
                    return res.status(403).json("Token Expired");
                }

                const user = await User.findOne({ email: decoded.email });
                // console.log(user);
                return res.status(200).json({
                    username: user.username,
                    email: user.email,
                    image: user.image,
                });
            }
        );
    } catch (error) {
        console.error('Error verifying recover token:', error);
        return res.status(500).json('Internal server error');
    }
};

const handleGoogleLogin = async (req, res) => {

    const { email, name, picture } = req.body;

    console.log("Login with google");

    try {
        // Check duplication
        let user = await User.findOne({ email });
        if (!user) {
            // If user doesn't exist, create a new user
            const username = normalizeVietnamese(name) + uuidv4().substring(0, 5);
            const password = uuidv4().substring(0, 6);;

            // Hash the generated password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create and save the new user
            user = new User({
                username,
                email,
                fullname: name,
                password: hashedPassword,
                image: picture,
            });
        }

        // create JWTs
        const accessToken = JWT.sign(
            {
                "UserInfo": {
                    "username": user.username,
                    "userId": user._id,
                    "email": user.email,
                    "fullname": user.fullname,
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '8h' }
        );
        const refreshToken = JWT.sign(
            {
                "UserInfo": {
                    "username": user.username,
                    "userId": user._id,
                    "email": user.email,
                    "fullname": user.fullname
                }
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        // Save refresh token with current user
        user.refreshToken = refreshToken;
        await user.save();

        // send refresh token as http cookie, last for 1d
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'Strict', secure: true, maxAge: 24 * 60 * 60 * 1000 });

        // Get user's stream token
        const streamToken = await streamServer.createToken(user.username);

        console.log("Login with google successful");

        res.status(200).json({
            accessToken: accessToken,
            fullname: user.fullname,
            userId: user._id,
            email: user.email,
            username: user.username,
            image: user.image || `https://getstream.io/random_png/?name=${user.username}`,
            streamToken: streamToken
        });
    } catch (error) {
        console.error("Error login with Google:", error);
        res.status(500).json("Error login with Google");
    }
};

function normalizeVietnamese(str) {
    str = str.replace(/A|Á|À|Ã|Ạ|Â|Ấ|Ầ|Ẫ|Ậ|Ă|Ắ|Ằ|Ẵ|Ặ/g, "A");
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/E|É|È|Ẽ|Ẹ|Ê|Ế|Ề|Ễ|Ệ/, "E");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/I|Í|Ì|Ĩ|Ị/g, "I");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/O|Ó|Ò|Õ|Ọ|Ô|Ố|Ồ|Ỗ|Ộ|Ơ|Ớ|Ờ|Ỡ|Ợ/g, "O");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/U|Ú|Ù|Ũ|Ụ|Ư|Ứ|Ừ|Ữ|Ự/g, "U");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/Y|Ý|Ỳ|Ỹ|Ỵ/g, "Y");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
    str = str.replace(/\u02C6|\u0306|\u031B/g, "");
    str = str.replace(/\s/g, "")
    return str;
}

module.exports = { handleLogin, handleForget, handleRecover, handleVerifyToken, handleGoogleLogin };
