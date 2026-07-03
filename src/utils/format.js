export const formatValidation = (errors) => {
    if (!errors || !Array.isArray(errors)) {
        return "Validation failed"
    }

    if (Array.isArray(errors.issues)) {
        return errors.issues.map(i => i.message).join(', ')
    }

    return JSON.stringify(errors)
}