import { useState } from 'react';
import type { FormEvent } from 'react';
import type { AdminPlan, PlanInput } from '../../services/admin';
import { formatSize } from '../../utils/format';
import { getErrorMessage } from '../../utils/errors';
import './Plans.css';

const AVAILABLE_MODELS = [
  { id: 'local-default', label: 'Local default' },
  { id: 'llama-3.1-8b', label: 'Llama 3.1 8B' },
  { id: 'mistral-7b', label: 'Mistral 7B' },
  { id: 'qwen-2.5-7b', label: 'Qwen 2.5 7B' },
];

function getModelOptions(plan: AdminPlan) {
  const knownModels = new Set(AVAILABLE_MODELS.map((model) => model.id));
  return [
    ...AVAILABLE_MODELS,
    ...plan.allowed_models
      .filter((modelId) => !knownModels.has(modelId))
      .map((modelId) => ({ id: modelId, label: modelId })),
  ];
}

interface PlansProps {
  plans: AdminPlan[];
  loading: boolean;
  onSave: (plan: AdminPlan, input: PlanInput) => Promise<void>;
}

function PlanCard({ plan, onSave }: {
  plan: AdminPlan;
  onSave: PlansProps['onSave'];
}) {
  const [name, setName] = useState(plan.name);
  const [storageLimit, setStorageLimit] = useState(
    plan.storage_limit_bytes === null
      ? ''
      : String(plan.storage_limit_bytes / (1024 ** 3)),
  );
  const [allowedModels, setAllowedModels] = useState(plan.allowed_models);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const modelOptions = getModelOptions(plan);

  function toggleModel(modelId: string) {
    setAllowedModels((currentModels) => currentModels.includes(modelId)
      ? currentModels.filter((model) => model !== modelId)
      : [...currentModels, modelId]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSaving(true);

    const storageGb = storageLimit === '' ? null : Number(storageLimit);
    if (storageGb !== null && (!Number.isFinite(storageGb) || storageGb < 0
      || storageGb * (1024 ** 3) > Number.MAX_SAFE_INTEGER)) {
      setError('Enter a valid storage limit.');
      setSaving(false);
      return;
    }

    try {
      await onSave(plan, {
        name: name.trim(),
        storage_limit_bytes: storageGb === null
          ? null
          : Math.round(storageGb * (1024 ** 3)),
        allowed_models: allowedModels,
      });
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="content-card plan-card" onSubmit={(event) => void handleSubmit(event)}>
      <div className="plan-card-heading">
        <div>
          <span className="plan-code">{plan.code}</span>
          <p>Configure the name, storage allowance and available models for this plan.</p>
        </div>
        <span className="plan-storage-summary">
          {plan.storage_limit_bytes === null ? 'Unlimited storage' : formatSize(plan.storage_limit_bytes)}
        </span>
      </div>
      <div className="plan-fields">
        <label>
          Plan name
          <input
            value={name}
            maxLength={100}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label>
          Storage limit (GB)
          <input
            type="number"
            min="0"
            step="0.1"
            value={storageLimit}
            onChange={(event) => setStorageLimit(event.target.value)}
            placeholder="Unlimited"
          />
        </label>
      </div>
      <fieldset className="plan-models">
        <legend>Included models</legend>
        <div className="model-options">
          {modelOptions.map((model) => (
            <label className="model-option" key={model.id}>
              <input
                type="checkbox"
                checked={allowedModels.includes(model.id)}
                onChange={() => toggleModel(model.id)}
              />
              <span>{model.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {error && <p className="plan-error" role="alert">{error}</p>}
      <div className="plan-card-actions">
        <button className="primary-button" disabled={saving}>
          {saving ? 'Saving...' : 'Save plan'}
        </button>
      </div>
    </form>
  );
}

function Plans({ plans, loading, onSave }: PlansProps) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">SUBSCRIPTION SETTINGS</p>
          <h1>Plans</h1>
          <p className="page-subtitle">Choose the storage limits and models included in each plan.</p>
          <p className="plan-metadata-note">
            These settings are saved as plan metadata; access limits are not enforced yet.
          </p>
        </div>
      </div>
      {loading ? (
        <div className="empty-state">Loading plans...</div>
      ) : plans.length === 0 ? (
        <div className="empty-state">No plans are available.</div>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => (
            <PlanCard key={plan.code} plan={plan} onSave={onSave} />
          ))}
        </div>
      )}
    </>
  );
}

export default Plans;
