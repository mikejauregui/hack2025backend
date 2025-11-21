import { ClientResponse } from "../../lib/Response";
import { createUser, generateEmailVerificationToken, getUserByEmail, createSession } from "../../lib/auth";
import { validateEmail, validatePassword, validateName, validateAge } from "../../lib/validation";
import { sendVerificationEmail } from "../../lib/email";

export async function signup(req: Request) {
  try {
    const body = await req.json();
    const { email, name, password, dateOfBirth } = body;

    // Validation
    if (!validateEmail(email)) {
      return ClientResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return ClientResponse.json({ error: passwordValidation.errors[0] }, { status: 400 });
    }

    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return ClientResponse.json({ error: nameValidation.error }, { status: 400 });
    }

    const ageValidation = validateAge(dateOfBirth);
    if (!ageValidation.valid) {
      return ClientResponse.json({ error: ageValidation.error }, { status: 400 });
    }

    // Check existing user
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return ClientResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Create user
    const user = await createUser(email, name, password, dateOfBirth);

    // Create session
    const session = await createSession(user.id, {
        user_agent: req.headers.get("user-agent") || undefined,
    });

    // Send verification email (async)
    const token = await generateEmailVerificationToken(user.id);
    sendVerificationEmail(email, name, token).catch(err => console.error("Failed to send email:", err));

    return ClientResponse.json({
      token: session.session_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        email_verified: user.email_verified
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    return ClientResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
