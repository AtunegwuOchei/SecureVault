import { useState, useEffect } from 'react';

interface BiometricCredential {
  id: string;
  publicKey: string;
}

export const useBiometric = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkSupport = async () => {
    try {
      const supported = !!(
        window.PublicKeyCredential &&
        navigator.credentials &&
        navigator.credentials.create &&
        navigator.credentials.get
      );

      if (supported) {
        // Check if platform authenticator is available
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsSupported(available);
      } else {
        setIsSupported(false);
      }
    } catch (error) {
      console.warn('Error checking biometric support:', error);
      setIsSupported(false);
    }
  };

  useEffect(() => {
    checkSupport();

    // Check if biometric is already enabled
    const enabled = localStorage.getItem('biometric_enabled') === 'true';
    setIsEnabled(enabled);
  }, []);

  const setupBiometric = async (username: string): Promise<boolean> => {
    if (!isSupported) {
      throw new Error('WebAuthn is not supported on this device');
    }

    setIsLoading(true);
    try {
      // Check if the browser supports the required APIs
      if (!navigator.credentials || !navigator.credentials.create) {
        throw new Error('This browser does not support biometric authentication');
      }

      // Check for platform authenticator availability
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        throw new Error('No biometric authenticator available on this device');
      }

      // Create new credentials
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: {
            name: 'Password Manager',
            id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(username),
            name: username,
            displayName: username,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },  // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'none'
        }
      }) as PublicKeyCredential;

      if (credential && credential.response) {
        // Extract the public key from the credential response
        const response = credential.response as AuthenticatorAttestationResponse;
        const clientDataJSON = new TextDecoder().decode(response.clientDataJSON);

        // Store the credential on the server
        const serverResponse = await fetch('/api/auth/biometric/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credentialId: credential.id,
            publicKey: Array.from(new Uint8Array(response.getPublicKey() || new ArrayBuffer(0))).join(',')
          }),
        });

        if (serverResponse.ok) {
          setIsEnabled(true);
          localStorage.setItem('biometric_enabled', 'true');
          localStorage.setItem('biometric_credential_id', credential.id);
          return true;
        } else {
          const errorData = await serverResponse.json();
          throw new Error(errorData.message || 'Failed to store biometric credentials');
        }
      }

      throw new Error('Failed to create biometric credential');
    } catch (error: any) {
      console.error('Biometric setup failed:', error);

      // Provide user-friendly error messages
      if (error.name === 'NotSupportedError') {
        throw new Error('Biometric authentication is not supported on this device');
      } else if (error.name === 'NotAllowedError') {
        throw new Error('Biometric authentication was cancelled or not allowed');
      } else if (error.name === 'InvalidStateError') {
        throw new Error('A credential with this ID already exists');
      } else if (error.name === 'SecurityError') {
        throw new Error('Security error: Make sure you are using HTTPS');
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to set up biometric authentication');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithBiometric = async (): Promise<{ username: string; token: string } | null> => {
    if (!isSupported || !isEnabled) {
      throw new Error('Biometric authentication is not available');
    }

    setIsLoading(true);

    try {
      const storedCredential = localStorage.getItem('biometric_credential');
      const storedUsername = localStorage.getItem('biometric_username');

      if (!storedCredential || !storedUsername) {
        throw new Error('No biometric credentials found');
      }

      const credential: BiometricCredential = JSON.parse(storedCredential);

      // Generate a random challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Create assertion options
      const credentialRequestOptions: CredentialRequestOptions = {
        publicKey: {
          challenge,
          allowCredentials: [
            {
              id: Uint8Array.from(atob(credential.publicKey), c => c.charCodeAt(0)),
              type: "public-key",
            },
          ],
          userVerification: "required",
          timeout: 60000,
        },
      };

      // Get the credential
      const assertion = await navigator.credentials.get(credentialRequestOptions) as PublicKeyCredential;

      if (assertion) {
        // Send biometric authentication request to server
        const response = await fetch('/api/auth/biometric', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: storedUsername,
            credentialId: credential.id,
            assertion: {
              id: assertion.id,
              rawId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))),
              response: {
                authenticatorData: btoa(String.fromCharCode(...new Uint8Array((assertion.response as AuthenticatorAssertionResponse).authenticatorData))),
                clientDataJSON: btoa(String.fromCharCode(...new Uint8Array((assertion.response as AuthenticatorAssertionResponse).clientDataJSON))),
                signature: btoa(String.fromCharCode(...new Uint8Array((assertion.response as AuthenticatorAssertionResponse).signature))),
              }
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return { username: storedUsername, token: data.token };
        } else {
          throw new Error('Server authentication failed');
        }
      }

      return null;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disableBiometric = () => {
    localStorage.removeItem('biometric_credential');
    localStorage.removeItem('biometric_enabled');
    localStorage.removeItem('biometric_username');
    setIsEnabled(false);
  };

  return {
    isSupported,
    isEnabled,
    isLoading,
    setupBiometric,
    authenticateWithBiometric,
    disableBiometric,
  };
};