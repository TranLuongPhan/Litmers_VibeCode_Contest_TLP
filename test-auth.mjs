import NextAuth from "next-auth"
console.log("NextAuth type:", typeof NextAuth)
console.log("NextAuth value:", NextAuth)
try {
    const result = NextAuth({})
    console.log("Result keys:", Object.keys(result))
} catch (e) {
    console.error("Error calling NextAuth:", e)
}
