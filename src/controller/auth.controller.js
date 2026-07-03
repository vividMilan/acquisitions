import logger from "#config/logger.js"
import { authenticateUser, createUser } from "#services/auth.service.js";
import { formatValidation } from "#utils/format.js";
import { signinSchema, signupSchema } from "#validations/auth.validation.js";
import { jwttoken } from "#utils/jwt.js";
import { cookies } from "#utils/cookies.js"

export const signUp = async (req, res, next) => {
    try {

        const validationResult = signupSchema.safeParse(req.body)

        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation error",
                details: formatValidation(validationResult.error)
            })
        }

        const { name, email, role, password } = validationResult.data

        const user = await createUser({name, email, role, password})

        const token = jwttoken.sign({id: user.id, email: user.email, role: user.role})

        cookies.set(res, 'token', token)

        logger.info(`User registered successfully: ${email}`)
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        logger.error("Signup error: ", error);

        if (error.message === "User with this email already exists") {
            return res.status(400).json({ message: "Email already exists" });
        }

        next(error)
    }

}

export const signIn = async (req, res, next) => {
    try {
        const validationResult = signinSchema.safeParse(req.body)

        const { email, password } = validationResult.data

        const user = await authenticateUser({email, password})

        const token = jwttoken.sign({id: user.id, email: user.email, role: user.role})

        cookies.set(res, 'token', token)

        logger.info(`User logged in successfully: ${email}`)

        return res.status(200).json({
            message: "Sign In Successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        logger.error("Signin error: ", error)

        // Clean handling for intentional login credential rejections
        if (error.message === "Invalid email or password") {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        // Pass unhandled service exceptions (e.g., db timeouts) down to express error handler middleware
        next(error)
    }
}

export const signOut = async (req, res, next) => {
    try {
        
        cookies.clear(res, 'token')

        logger.info("User signed out successfully")

        return res.status(200).json({
            message: "Sign out successfully"
        })

    } catch (error) {
        logger.error("Signout error: ", error)
        next(error)
    }
}