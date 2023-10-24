import { defu } from 'defu'
import {
  acceptUserInvite as sdkAcceptUserInvite,
  inviteUser as sdkInviteUser,
  passwordRequest as sdkPasswordRequest,
  passwordReset as sdkPasswordReset
} from '@directus/sdk'
import type {
  DirectusClientConfig,
  DirectusInviteUser,
  DirectusUser,
  LoginOptions
} from '../types'

export function useDirectusAuth<TSchema extends Object> () {
  const client = (useStaticToken: boolean | string = false) => {
    return useDirectusRest<TSchema>({
      useStaticToken
    })
  }
  const { useNuxtCookies } = useRuntimeConfig().public.directus.authConfig

  const { readMe, setUser, user } = useDirectusUsers()
  const { tokens } = useDirectusTokens()

  async function login (
    identifier: string, password: string, options?: LoginOptions
  ) {
    try {
      const defaultOptions = {
        mode: useNuxtCookies ? 'json' : 'cookie'
      }
      const params = defu(options, defaultOptions) as LoginOptions

      const authResponse = await client().login(identifier, password, params)
      const userData = await readMe({ useStaticToken: false })
      setUser(userData)

      return {
        access_token: authResponse.access_token,
        refresh_token: authResponse.refresh_token,
        expires_at: authResponse.expires_at,
        expires: authResponse.expires
      }
    } catch (error: any) {
      if (error && error.message) {
        console.error("Couldn't login user", error.errors)
      } else {
        console.error(error)
      }
    }
  }

  async function refreshTokens () {
    try {
      const authResponse = await client().refresh()
      const userData = await readMe({ useStaticToken: false })
      setUser(userData)

      return {
        access_token: authResponse.access_token,
        refresh_token: authResponse.refresh_token,
        expires_at: authResponse.expires_at,
        expires: authResponse.expires
      }
    } catch (error: any) {
      if (error && error.message) {
        console.error("Couldn't refresh tokens", error.errors)
      } else {
        console.error(error)
      }
    }
  }

  async function logout () {
    try {
      await client().logout()
      user.value = undefined
    } catch (error: any) {
      if (error && error.message) {
        console.error("Couldn't logut user", error.errors)
      } else {
        console.error(error)
      }
    }
  }

  async function passwordRequest (
    email: string,
    resetUrl?: string,
    params?: DirectusClientConfig
  ) {
    try {
      await client(params?.useStaticToken).request(sdkPasswordRequest(email, resetUrl))
    } catch (error: any) {
      if (error && error.message) {
        console.error("Couldn't request password reset", error.errors)
      } else {
        console.error(error)
      }
    }
  }

  async function passwordReset (
    token: string,
    password: string,
    params?: DirectusClientConfig
  ) {
    try {
      await client(params?.useStaticToken).request(sdkPasswordReset(token, password))
    } catch (error: any) {
      if (error && error.message) {
        console.error("Couldn't reset password", error.errors)
      } else {
        console.error(error)
      }
    }
  }

  async function inviteUser (
    email: string,
    role: string,
    params?: DirectusInviteUser
  ) {
    try {
      await client(params?.useStaticToken).request(sdkInviteUser(email, role, params?.invite_url))
    } catch (error: any) {
      if (error && error.message) {
        console.error("Couldn't invite user", error.errors)
      } else {
        console.error(error)
      }
    }
  }

  async function acceptUserInvite (
    token: string,
    password: string,
    params?: DirectusClientConfig
  ) {
    try {
      await client(params?.useStaticToken).request(sdkAcceptUserInvite(token, password))
    } catch (error: any) {
      if (error && error.message) {
        console.error("Couldn't accept user invite", error.errors)
      } else {
        console.error(error)
      }
    }
  }

  return {
    acceptUserInvite,
    inviteUser,
    login,
    logout,
    passwordRequest,
    passwordReset,
    refreshTokens,
    tokens,
    user
  }
}