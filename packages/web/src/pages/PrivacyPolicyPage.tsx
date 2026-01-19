import '../styles/pages/privacy-policy-page.css'

export function PrivacyPolicyPage() {
  return (
    <div className="privacy-policy-page">
      <div className="privacy-policy-page__content">
        <h1>Privacy Policy</h1>
        <p className="privacy-policy-page__intro">
          A community-driven knowledge base and wiki for video game modding. Users can browse tutorials, guides,
          and documentation for game modding, create accounts to bookmark articles, track learning progress, and
          access curated learning paths. The service includes both a web application and mobile app for accessing
          modding resources.
        </p>

        <section className="privacy-policy-page__notice">
          <h2>Privacy Notice</h2>
          <p>
            This privacy policy will be updated with complete information about how we collect, use, and protect
            your personal data. We are committed to transparency and protecting your privacy rights under applicable
            data protection laws including GDPR and CCPA.
          </p>
          <p>
            For any questions about our privacy practices, please contact us at{' '}
            <a href="mailto:dystopianoutcasts@gmail.com">dystopianoutcasts@gmail.com</a>
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          <p>When you use our service, we collect the following information:</p>
          <ul>
            <li>Account information (email address, username, display name)</li>
            <li>Authentication data (encrypted passwords, OAuth tokens)</li>
            <li>User-generated content (bookmarks, progress tracking)</li>
            <li>Technical data (IP address, browser type, device information)</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and maintain our service</li>
            <li>Authenticate your account and manage your access</li>
            <li>Personalize your experience (bookmarks, learning progress)</li>
            <li>Send password reset emails when requested</li>
            <li>Improve our service quality and user experience</li>
            <li>Prevent fraud, abuse, and enforce our terms of service</li>
          </ul>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>We use the following third-party services that may collect and process your data:</p>
          <ul>
            <li>
              <strong>Supabase</strong> - Database and authentication backend
              (<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)
            </li>
            <li>
              <strong>Discord OAuth</strong> - Optional social login
              (<a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)
            </li>
            <li>
              <strong>Google OAuth</strong> - Optional social login
              (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)
            </li>
            <li>
              <strong>GitHub Pages</strong> - Website hosting
              (<a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)
            </li>
          </ul>
        </section>

        <section>
          <h2>Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your data:</p>
          <ul>
            <li>Passwords encrypted with industry-standard bcrypt hashing</li>
            <li>HTTPS encryption for all data transmission</li>
            <li>Secure authentication tokens</li>
            <li>Row-level security policies on our database</li>
            <li>Regular security updates and monitoring</li>
          </ul>
        </section>

        <section>
          <h2>Your Rights</h2>
          <p>Under applicable data protection laws, you have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Opt-out of communications</li>
            <li>Object to data processing</li>
          </ul>
          <p>
            To exercise these rights, please contact us at{' '}
            <a href="mailto:dystopianoutcasts@gmail.com">dystopianoutcasts@gmail.com</a>
          </p>
        </section>

        <section>
          <h2>Data Retention</h2>
          <p>
            We retain your personal data for as long as your account is active or as needed to provide our services.
            If you request account deletion, we will remove your data within 30 days, except where we are required
            to retain it for legal compliance.
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. We do not use advertising or
            third-party tracking cookies.
          </p>
        </section>

        <section>
          <h2>Children's Privacy</h2>
          <p>
            Our service is not directed at individuals under 18 years of age. We do not knowingly collect personal
            information from children. If you are under 18, please do not use our service or provide any personal
            information.
          </p>
        </section>

        <section>
          <h2>International Data Transfers</h2>
          <p>
            Your data may be transferred to and processed in countries other than your country of residence.
            We ensure appropriate safeguards are in place to protect your data in compliance with applicable laws.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of material changes by
            posting a prominent notice on our website or by email. Your continued use of our service after
            changes become effective constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>If you have questions about this privacy policy, please contact us:</p>
          <ul>
            <li>Email: <a href="mailto:dystopianoutcasts@gmail.com">dystopianoutcasts@gmail.com</a></li>
            <li>Website: <a href="https://dystopianoutcasts.wiki">dystopianoutcasts.wiki</a></li>
          </ul>
        </section>

        <p className="privacy-policy-page__updated">Last updated: January 19, 2026</p>
      </div>
    </div>
  )
}
