import logger from "#config/logger.js"
import bcrypt from "bcrypt"
import { eq } from "drizzle-orm"
import { db } from '#config/database.js'
import { users } from "#models/users.models.js"

export const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10)
    } catch (error) {
        logger.error(`Error hashing password: ${error}`)
        throw new Error("Error hashing password")
    }
}

export const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword)
    } catch (error) {
        logger.error(`Error Comparing Password`)
        throw new Error(`Error Comparing Password`)
    }
}

export const createUser = async ({name, email, password, role = 'user'}) => {
    try {
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)

        if (existingUser.length > 0) {
            throw new Error("User with this email already exists")
        }

        const hashedPassword = await hashPassword(password)

        const [newUser] = await db
            .insert(users)
            .values({ 
                name, 
                email, 
                password: hashedPassword, 
                role 
            })
            .returning({
                id: users.id, 
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.created_at,
            })

            logger.info(`User ${newUser.email} created successfully`)
            return newUser
    } catch (error) {
        logger.error(`Error creating user: ${error.message || error}`)
        throw new Error(error.message || "Error creating user")
    }
}

export const authenticateUser = async ({email, password}) => {
    try {
        const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1)

        if (!existingUser) {
            throw new Error("Invalid email or password")
        }

        const passwordValid = await comparePassword(password, existingUser.password)

        if (!passwordValid) {
            throw new Error("Invalid email or password")
        }

        logger.info(`User ${existingUser.email} authenticated successfully`)

        return {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            createdAt: existingUser.created_at
        }

    } catch (error) {
        logger.error(`Error authentication user: ${e}`)
        throw error
    }
}