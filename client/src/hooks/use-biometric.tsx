
import { useState, useEffect } from 'react';

interface BiometricCredential {
  id: string;
  publicKey: string;
}

export const useBiometric = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if WebAuthn is supported
    const checkSupport = () => {
      const supported = typeof window !== 'undefined' && 
                       'credentials' in navigator && 
                       'create' in navigator.credentials &&
                       'get' in navigator.credentials;
      setIsSupported(supported);
    };

    checkSupport();

    // Check if biometric is already enabled
    const biometricEnabled = localStorage.getItem('biometric_enabled') === 'true';
    setIsEnabled(biometricEnabled);
  }, []);

  const setupBiometric = async (username: string): Promise<boolean> => {
    if (!isSupported) {
      throw new Error('Biometric authentication is not supported on this device');
    }

    setIsLoading(true);

    try {
      // Generate a random challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Create credential options
      const credentialCreationOptions: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: {
            name: "SecureVault",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(username),
            name: username,
            displayName: username,
          },
          pubKeyCredParams: [
            {
              type: "public-key",
              alg: -7, // ES256
            },
            {
              type: "public-key", 
              alg: -257, // RS256
            }
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            requireResidentKey: false,
          },
          timeout: 60000,
          attestation: "direct",
        },
      };

      // Create the credential
      const credential = await navigator.credentials.create(credentialCreationOptions) as PublicKeyCredential;

      if (credential) {
        // Store credential info locally
        const credentialInfo: BiometricCredential = {
          id: credential.id,
          publicKey: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
        };

        localStorage.setItem('biometric_credential', JSON.stringify(credentialInfo));
        localStorage.setItem('biometric_enabled', 'true');
        localStorage.setItem('biometric_username', username);
        
        setIsEnabled(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Biometric setup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithBiometric = async (): Promise<string | null> => {
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
        return storedUsername;
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
