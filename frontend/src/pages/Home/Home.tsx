import "./Home.css";

import { useEffect, useState } from "react";
import Nav from "../../components/Nav/Nav.tsx";
import Footer from "../../components/Footer/Footer.tsx";
import Welcome from "../../components/Welcome/Welcome.tsx";
import Chat from "../../components/Chat/Chat.tsx";
import Library from "../../components/LastFiles/LastFiles.tsx";
import cloudIcon from "../../assets/icons/cloud.svg";
import planIcon from "../../assets/icons/sell.svg";
import { getCurrentUser } from "../../services/auth.ts";
import { listDocuments, type DocumentItem } from "../../services/documents.ts";
import { getPlan, type Plan } from "../../services/plans.ts";

interface HomeOverview {
    plan: Plan;
    documents: DocumentItem[];
}

function formatFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function Home() {
    const [overview, setOverview] = useState<HomeOverview | null>(null);
    const [overviewError, setOverviewError] = useState("");

    useEffect(() => {
        let isActive = true;

        async function loadOverview() {
            try {
                const user = await getCurrentUser();
                const [plan, documents] = await Promise.all([
                    getPlan(user.plan),
                    listDocuments(),
                ]);

                if (isActive) {
                    setOverview({ plan, documents });
                }
            } catch (error) {
                if (isActive) {
                    setOverviewError(
                        error instanceof Error
                            ? error.message
                            : "Could not load your account overview.",
                    );
                }
            }
        }

        void loadOverview();

        return () => {
            isActive = false;
        };
    }, []);

    const usedBytes = overview?.documents.reduce(
        (total, document) => total + document.fileSize,
        0,
    ) ?? 0;
    const storageLimit = overview?.plan.storage_limit_bytes ?? 0;
    const remainingBytes = Math.max(storageLimit - usedBytes, 0);
    const storageUsage = storageLimit > 0
        ? Math.min((usedBytes / storageLimit) * 100, 100)
        : 0;

    return (
        <div className="home">
            <Nav page="HOME" />

            <main className="layout">
                <Welcome />

                <div className="home-content">
                    <div className="home-library-column">
                        <section className="home-overview" aria-label="Account overview">
                            {overviewError ? (
                                <p className="home-overview-error" role="alert">
                                    {overviewError}
                                </p>
                            ) : overview ? (
                                <>
                                    <article className="home-stat-card">
                                        <div className="home-stat-heading">
                                            <img src={cloudIcon} alt="" className="home-stat-icon" />
                                            <span>Storage remaining</span>
                                        </div>
                                        <strong className="home-stat-value">
                                            {formatFileSize(remainingBytes)}
                                        </strong>
                                        <span className="home-stat-caption">
                                            of {formatFileSize(storageLimit)} total
                                        </span>
                                        <div
                                            className="home-storage-progress"
                                            role="progressbar"
                                            aria-label="Storage used"
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-valuenow={Math.round(storageUsage)}
                                        >
                                            <span style={{ width: `${storageUsage}%` }} />
                                        </div>
                                        <span className="home-stat-detail">
                                            {formatFileSize(usedBytes)} used
                                        </span>
                                    </article>

                                    <article className="home-stat-card">
                                        <div className="home-stat-heading">
                                            <img src={planIcon} alt="" className="home-stat-icon" />
                                            <span>Current plan</span>
                                        </div>
                                        <strong className="home-stat-value">
                                            {overview.plan.name}
                                        </strong>
                                        <span className="home-stat-caption">
                                            {overview.plan.code} plan
                                        </span>
                                        <span className="home-stat-detail">
                                            {formatFileSize(storageLimit)} storage
                                        </span>
                                    </article>
                                </>
                            ) : (
                                <p className="home-overview-loading" aria-live="polite">
                                    Loading account overview...
                                </p>
                            )}
                        </section>

                        <Library />
                    </div>
                    <Chat />
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Home;
