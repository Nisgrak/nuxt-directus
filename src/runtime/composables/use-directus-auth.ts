import { defu } from 'defu'
import {
  login as sdkLogin,
  refresh as sdkRefresh,
  logout as sdkLogout,
  acceptUserInvite as sdkAcceptUserInvite,
  inviteUser as sdkInviteUser,
  passwordRequest as sdkPasswordRequest,
  passwordReset as sdkPasswordReset
} from '@directus/sdk'
import type {
  AuthenticationMode,
  DirectusRestConfig,
  DirectusInviteUser,
  LoginOptions
} from '../types'

export function useDirectusAuth<TSchema extends Object> (config?: Partial<DirectusRestConfig>) {
  const { useNuxtCookies } = useRuntimeConfig().public.directus.authConfig
  const nuxtApp = useNuxtApp()

  const defaultConfig: Partial<DirectusRestConfig> = {
    useStaticToken: false
  }
  const client = useDirectusRest<TSchema>(defu(config, defaultConfig))

  const {
    readMe,
    setUser,
    user
  } = useDirectusUsers(defu(config, defaultConfig))
  const {
    refreshToken: refreshTokenCookie,
    set: setTokens,
    tokens
  } = useDirectusTokens(config?.useStaticToken ?? defaultConfig.useStaticToken)
  const defaultMode: AuthenticationMode = useNuxtCookies ? 'json' : 'cookie'

  /**
   * Retrieve a temporary access token and refresh token.
   *
   * @param identifier Email address of the user you're retrieving the access token for.
   * @param password Password of the user.
   * @param options Optional login settings
   *
   * @returns The access and refresh tokens for the session
   */
  async function login (
    identifier: string, password: string, options?: LoginOptions
  ) {
    try {
      const params = defu(options, { defaultMode })

      const authResponse = await client.request(sdkLogin(identifier, password, params))
      if (authResponse.access_token) {
        nuxtApp.runWithContext(() => {
          setTokens(authResponse)
          readMe()
        })
      }

      return {
        access_token: authResponse.access_token,
        refresh_token: authResponse.refresh_token,
        expires_at: authResponse.expires_at,
        expires: authResponse.expires
      }
    } catch (error: any) {
      if (error && error.message) {
        console.error("Couldn't login user.", error.message)
      } else {
        console.error(error)
      }
    }
  }

  /**
   * Retrieve a new access token using a refresh token.
   *
   * @param mode Whether to retrieve the refresh token in the JSON response, or in a httpOnly secure cookie. One of json, cookie.
   * @param refreshToken The refresh token to use. If you have the refresh token in a cookie through /auth/login, you don't have to submit it here.
   *
   * @returns The new access and refresh tokens for the session.
   */
  async function refreshTokens ({
    refreshToken,
    mode
  }: {
    refreshToken?: string
    mode?: AuthenticationMode
  } = {}) {
    try {
      const token = refreshToken ?? tokens.value?.refresh_token ?? refreshTokenCookie().value ?? undefined
      if (!refreshToken && useNuxtCookies) {
        throw new Error('No refresh token found.')
      }

      const authResponse = await client.request(sdkRefresh(mode ?? defaultMode, token ?? undefined))
      if (authResponse.access_token) {
        nuxtApp.runWithContext(() => {
          setTokens(authResponse)
          readMe()
        })
      }

      return {
        access_token: authResponse.access_token,
        refresh_token: authResponse.refresh_token,
        expires_at: authResponse.expires_at,
        expires: authResponse.expires
      }
    } catch (error: any) {
      if (error && error.message) {
        console.error("Couldn't refresh tokens.", error.message)
      } else {
        console.error(error)
      }
    }
  }

  /**
   * Invalidate the refresh token thus destroying the user's session.
   *
   * @param refreshToken The refresh token to invalidate. If you have the refresh token in a cookie through /auth/login, you don't have to submit it here.
   *
   * @returns Empty body.
   */
  async function logout (
    refreshToken?: string
  ) {
    try {
      await client.request(sdkLogout(refreshToken ?? tokens.value?.refresh_token ?? undefined))
      user.value = undefined
      setTokens(null)
    } catch (error: any) {
      if (error && error.message) {
        console.error("Couldn't logut user.", error.message)
      } else {
        console.error(error)
      }
    }
  }

  /**
   * Request a password reset email to be sent to the given user.
   *
   * @param email Email address of the user you're requesting a password reset for.
   * @param resetUrl Provide a custom reset url which the link in the email will lead to. The reset token will be passed as a parameter.
   *
   * @returns Empty body.
   */
  async function passwordRequest (
    email: string,
    resetUrl?: string
  ) {
    try {
      await client.request(sdkPasswordRequest(email, resetUrl))
    } catch (error: any) {
      if (error && error.message) {
        console.error("Couldn't request password reset.", error.message)
      } else {
        console.error(error)
      }
    }
  }

  /**
   * The request a password reset endpoint sends an email with a link to the admin app (or a custom route) which in turn uses this endpoint to allow the user to reset their password.
   *
   * @param token Password reset token, as provided in the email sent by the request endpoint.
   * @param password New password for the user.
   *
   * @returns Empty body.
   */
  async function passwordReset (
    token: string,
    password: string
  ) {
    try {
      await client.request(sdkPasswordReset(token, password))
    } catch (error: any) {
      if (error && error.message) {
        console.error("Couldn't reset password.", error.message)
      } else {
        console.error(error)
      }
    }
  }

  /**
   * Invite a new user by email.
   *
   * @param email User email to invite.
   * @param role Role of the new user.
   * @param invite_url Provide a custom invite url which the link in the email will lead to. The invite token will be passed as a parameter.
   *
   * @returns Nothing.
   */
  async function inviteUser (
    email: string,
    role: string,
    params?: DirectusInviteUser
  ) {
    try {
      await client.request(sdkInviteUser(email, role, params?.invite_url))
    } catch (error: any) {
      if (error && error.message) {
        console.error("Couldn't invite user.", error.message)
      } else {
        console.error(error)
      }
    }
  }

  /**
   * Accept your invite. The invite user endpoint sends the email a link to the Admin App.
   *
   * @param token Accept invite token.
   * @param password Password for the user.
   *
   * @returns Nothing.
   */
  async function acceptUserInvite (
    token: string,
    password: string
  ) {
    try {
      await client.request(sdkAcceptUserInvite(token, password))
    } catch (error: any) {
      if (error && error.message) {
        console.error("Couldn't accept user invite.", error.message)
      } else {
        console.error(error)
      }
    }
  }

  return {
    client,
    acceptUserInvite,
    inviteUser,
    login,
    logout,
    passwordRequest,
    passwordReset,
    refreshTokens,
    refreshTokenCookie,
    readMe,
    setUser,
    setTokens,
    tokens,
    user
  }
}
