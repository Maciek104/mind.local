import "./Account.css"

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react"

import Nav from "../../components/Nav/Nav.tsx"
import Footer from "../../components/Footer/Footer.tsx"
import personIcon from "../../assets/icons/person.svg"
import saveIcon from "../../assets/icons/save.svg"
import uploadIcon from "../../assets/icons/upload.svg"
import deleteIcon from "../../assets/icons/delete.svg"
import {
    deleteAvatar,
    getCurrentUser,
    uploadAvatar,
    updateCurrentUser,
    type AuthenticatedUser,
} from "../../services/auth"

function Account() {
    const [user, setUser] = useState<AuthenticatedUser | null>(null)
    const [displayName, setDisplayName] = useState("")
    const [bio, setBio] = useState("")
    const [avatarVersion, setAvatarVersion] = useState(0)
    const avatarInput = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    useEffect(() => {
        void getCurrentUser()
            .then((currentUser) => {
                setUser(currentUser)
                setDisplayName(currentUser.display_name ?? "")
                setBio(currentUser.bio ?? "")
            })
            .catch((err: unknown) => {
                setError(err instanceof Error
                    ? err.message
                    : "Could not load your account details.")
            })
            .finally(() => setLoading(false))
    }, [])

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setSaving(true)
        setError("")
        setSuccess("")

        try {
            const updatedUser = await updateCurrentUser({
                display_name: displayName.trim() || null,
                bio: bio.trim() || null,
            })
            setUser(updatedUser)
            setDisplayName(updatedUser.display_name ?? "")
            setBio(updatedUser.bio ?? "")
            setSuccess("Your changes have been saved.")
        } catch (err) {
            setError(err instanceof Error
                ? err.message
                : "Could not save your profile.")
        } finally {
            setSaving(false)
        }
    }

    async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return

        setSaving(true)
        setError("")
        setSuccess("")

        try {
            const updatedUser = await uploadAvatar(file)
            setUser(updatedUser)
            setAvatarVersion((version) => version + 1)
            setSuccess("Avatar uploaded.")
        } catch (err) {
            setError(err instanceof Error
                ? err.message
                : "Could not upload your avatar.")
        } finally {
            setSaving(false)
            event.target.value = ""
        }
    }

    async function handleAvatarDelete() {
        setSaving(true)
        setError("")
        setSuccess("")

        try {
            const updatedUser = await deleteAvatar()
            setUser(updatedUser)
            setAvatarVersion((version) => version + 1)
            setSuccess("Avatar removed.")
        } catch (err) {
            setError(err instanceof Error
                ? err.message
                : "Could not remove your avatar.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="account">
            <Nav page="ACCOUNT" />

            <main className="layout">
                {loading ? (
                    <div className="account-status">Loading account...</div>
                ) : (
                    <>
                        <section className="account-summary">
                            <div className="account-summary-content">
                                <h1>{displayName || user?.email || "Account"}</h1>
                                <span>{user?.email}</span>
                            </div>

                            <div className="profile-image">
                                {user?.profile_image_path ? (
                                    <img
                                        src={`http://localhost:3000/users/me/avatar?v=${avatarVersion}`}
                                        alt="Profile photo"
                                    />
                                ) : (
                                    <img
                                        className="profile-fallback"
                                        src={personIcon}
                                        alt=""
                                    />
                                )}
                            </div>
                        </section>

                        <form className="account-form" onSubmit={handleSubmit}>
                            <div className="account-form-title">
                                <img
                                    src={personIcon}
                                    alt=""
                                    className="icon"
                                />
                                <h2>Profile details</h2>
                            </div>

                            <div className="account-form-content">
                                <div className="account-profile-row">
                                    <div className="account-field">
                                        <input
                                            type="text"
                                            value={displayName}
                                            maxLength={100}
                                            onChange={(event) =>
                                                setDisplayName(event.target.value)
                                            }
                                            placeholder="Display name"
                                        />
                                    </div>

                                    <input
                                        ref={avatarInput}
                                        className="avatar-input"
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleAvatarChange}
                                    />

                                    <button
                                        className="avatar-button account-action-button"
                                        type="button"
                                        onClick={() =>
                                            user?.profile_image_path
                                                ? void handleAvatarDelete()
                                                : avatarInput.current?.click()
                                        }
                                        disabled={saving}
                                    >
                                        <img
                                            src={user?.profile_image_path ? deleteIcon : uploadIcon}
                                            alt=""
                                            className="icon"
                                        />
                                        {user?.profile_image_path ? "Remove avatar" : "Upload avatar"}
                                    </button>
                                </div>

                                <div className="account-field">
                                    <textarea
                                        value={bio}
                                        maxLength={1000}
                                        onChange={(event) =>
                                            setBio(event.target.value)
                                        }
                                        placeholder="Write something about yourself"
                                        rows={5}
                                    />
                                </div>

                                {error ? <div className="account-error">{error}</div> : null}
                                {success ? <div className="account-success">{success}</div> : null}

                                <div className="account-actions">
                                    <button className="account-action-button" type="submit" disabled={saving}>
                                        <img src={saveIcon} alt="" className="icon" />
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </div>
                        </form>

                        <section className="account-info">
                            <div className="account-info-item">
                                <span>Email</span>
                                <strong>{user?.email}</strong>
                            </div>
                            <div className="account-info-item">
                                <span>Role</span>
                                <strong>{user?.role}</strong>
                            </div>
                            <div className="account-info-item">
                                <span>Plan</span>
                                <strong>{user?.plan}</strong>
                            </div>
                        </section>
                    </>
                )}
            </main>

            <Footer />
        </div>
    )
}

export default Account;