<?php

// Authentication/account pages: Login, Register, DetailAccount, ForgetPassword,
// ForgetPasswordSuccess, ResetPassword, Banned.
return [
    // ── Login ──
    'login' => [
        'meta_title' => 'Sign In',
        'meta_description' => 'Discover the best recommendations for attractions, cuisine, and rest stops along intercity travel routes in Indonesia with NuraLoka.',
        'welcome_greeting' => 'Hi, Nuravers!',
        'welcome_back' => 'Welcome back to',
        'title' => 'Sign In',
        'subtitle' => 'Sign in to your account to explore Indonesia with :app!',
        'identity_label' => 'Email or Username',
        'identity_placeholder' => 'your.email@gmail.com',
        'password_label' => 'Password',
        'password_placeholder' => 'Your password',
        'forgot_password' => 'Forgot password?',
        'remember_me' => 'Remember Me for the Next 30 Days',
        'submit' => 'Sign In',
        'submit_processing' => 'Checking data...',
        'google' => 'Sign in with Google',
        'no_account' => "Don't have an account?",
        'register_now' => 'Register Now!',
    ],

    // Login background slides (place names & locations kept as proper nouns)
    'login_slides' => [
        ['name' => 'Borobudur Temple', 'loc' => 'Magelang, Central Java', 'desc' => "The world's largest Buddhist temple with its iconic stupas and a UNESCO World Heritage Site."],
        ['name' => 'Mount Kerinci', 'loc' => 'Kerinci, Jambi', 'desc' => "Sumatra's highest peak with majestic scenery, often shrouded in mist."],
        ['name' => 'Papeda', 'loc' => 'Jayapura, Papua', 'desc' => 'A traditional dish made from sago with a thick texture, usually served with fish soup.'],
        ['name' => 'Traditional Weaving', 'loc' => 'Sikka, East Nusa Tenggara', 'desc' => 'Weaving cloth on traditional looms with colored threads, producing distinctive regional patterns.'],
        ['name' => 'Kilometer 0 of Indonesia', 'loc' => 'Sabang, Aceh', 'desc' => "A monument marking Indonesia's zero-kilometer point as the westernmost edge of the nation."],
    ],

    // ── Register ──
    'register' => [
        'layout_title' => 'Create Account',
        'title' => 'Create Account',
        'subtitle' => 'Join :app now and start exploring Indonesia!',
        'username_label' => 'Username',
        'username_placeholder' => 'funnyname123',
        'email_label' => 'Email',
        'email_placeholder' => 'your.email@gmail.com',
        'password_label' => 'Password',
        'password_placeholder' => 'Your password',
        'confirm_label' => 'Confirm Password',
        'confirm_placeholder' => 'Confirm your password',
        'submit' => 'Create Account',
        'submit_processing' => 'Registering account...',
        'google' => 'Register with Google',
        'have_account' => 'Already have an account?',
        'login_now' => 'Sign In Now!',
    ],

    // ── Account details (complete profile) ──
    'detail' => [
        'layout_title' => 'Account Information',
        'title' => 'Account Information',
        'subtitle' => 'One more step to become part of :app!',
        'fullname_label' => 'Full Name',
        'fullname_placeholder' => 'Your Full Name',
        'dob_label' => 'Date of Birth',
        'gender_label' => 'Gender',
        'gender_placeholder' => 'Your gender',
        'province_label' => 'Province of Residence',
        'province_placeholder' => 'The province you currently live in',
        'data_approval' => 'I have read and agree to the use of my personal data for the registration and account confirmation process.',
        'submit' => 'Save Data and Sign In',
        'submit_processing' => 'Checking data...',
    ],

    // ── Forgot password ──
    'forgot' => [
        'meta_title' => 'Reset Password',
        'title' => 'Reset Password',
        'desc' => "Enter the email registered to your account. We'll send a link to reset your password to your email.",
        'email_placeholder' => 'Enter your account email address...',
        'submit' => 'Send Password Reset Link',
        'submit_processing' => 'Sending...',
        'remember_password' => 'Remembered your password?',
        'login_now' => 'Sign In Now!',
    ],

    // ── Forgot password (sent successfully) ──
    'forgot_success' => [
        'title' => 'Verification email sent successfully!',
        'desc' => 'Please check your email to verify it before resetting your password.',
        'back_to_login' => 'Back to the sign-in page',
    ],

    // ── Reset password ──
    'reset' => [
        'meta_title' => 'Reset Password',
        'title' => 'Reset Password',
        'for_account' => 'for the account :name',
        'password_label' => 'New Password',
        'password_placeholder' => 'Enter your new password',
        'confirm_label' => 'Confirm New Password',
        'confirm_placeholder' => 'Re-enter your new password',
        'submit' => 'Save Password',
        'submit_processing' => 'Saving...',
    ],

    // ── Account banned ──
    'banned' => [
        'meta_title' => 'Account Banned',
        'title' => 'Your Account Has Been Banned',
        'desc' => 'Sorry, your account has been banned and currently cannot access NuraLoka services. Please contact the administrator if you believe this is a mistake.',
        'back_home' => 'Back to Home',
    ],

    // Gender (used in account forms)
    'gender_male' => 'Male',
    'gender_female' => 'Female',
    'gender_unspecified' => 'Prefer not to say',
];
