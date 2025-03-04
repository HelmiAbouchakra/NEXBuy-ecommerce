<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmailValidationService
{
    /**
     * Validate email using Abstract API
     *
     * @param string $email
     * @return array
     */
    public function validate(string $email): array
    {
        try {
            $response = Http::get(config('services.abstract_api.email_validation_url'), [
                'api_key' => config('services.abstract_api.key'),
                'email' => $email
            ]);

            if ($response->successful()) {
                $data = $response->json();

                return [
                    'is_valid' => $this->isEmailValid($data),
                    'message' => $this->getValidationMessage($data),
                    'data' => $data
                ];
            }

            // API request failed
            Log::warning('Abstract API email validation failed', [
                'email' => $email,
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            return [
                'is_valid' => true, // Default to true on API failure to not block registration
                'message' => 'Email validation service unavailable. Proceeding with verification.',
                'data' => null
            ];

        } catch (\Exception $e) {
            // Exception occurred
            Log::error('Exception during email validation: ' . $e->getMessage(), [
                'email' => $email
            ]);

            return [
                'is_valid' => true, // Default to true on exception to not block registration
                'message' => 'Email validation service error. Proceeding with verification.',
                'data' => null
            ];
        }
    }

    /**
     * Determine if the email is valid based on API response
     *
     * @param array $data
     * @return bool
     */
    private function isEmailValid(array $data): bool
    {
        // Check for critical validation issues
        if (isset($data['is_valid_format'])) {
            // Fail if email format is invalid
            if ($data['is_valid_format']['value'] === false) {
                return false;
            }
        }

        // Check for disposable email
        if (isset($data['is_disposable_email'])) {
            if ($data['is_disposable_email']['value'] === true) {
                return false; // Reject disposable emails
            }
        }

        // Check deliverability quality
        if (isset($data['deliverability'])) {
            // Reject if deliverability is "UNDELIVERABLE"
            if ($data['deliverability'] === 'UNDELIVERABLE') {
                return false;
            }
        }

        return true;
    }

    /**
     * Get human-readable validation message
     *
     * @param array $data
     * @return string
     */
    private function getValidationMessage(array $data): string
    {
        if (isset($data['is_valid_format']) && $data['is_valid_format']['value'] === false) {
            return 'The email address format is invalid.';
        }

        if (isset($data['is_disposable_email']) && $data['is_disposable_email']['value'] === true) {
            return 'Please use a non-disposable email address.';
        }

        if (isset($data['deliverability']) && $data['deliverability'] === 'UNDELIVERABLE') {
            return 'This email address appears to be undeliverable.';
        }

        return 'Email is valid.';
    }
}
