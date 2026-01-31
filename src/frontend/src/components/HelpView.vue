<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
    pixelId?: string;
}>();

const params = ref<Array<{ key: string; value: string }>>([
    { key: '', value: '' }
]);

const maxParams = 10;

const embedUrl = computed(() => {
    if (!props.pixelId) return '';

    const baseUrl = `${window.location.origin}/p/${props.pixelId}.gif`;
    const queryParams = params.value
        .filter(p => p.key && p.value)
        .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&');

    return queryParams ? `${baseUrl}?${queryParams}` : baseUrl;
});

const embedCode = computed(() => {
    return `<img src="${embedUrl.value}" width="1" height="1" style="display:none;" alt="" />`;
});

function addParam() {
    if (params.value.length < maxParams) {
        params.value.push({ key: '', value: '' });
    }
}

function removeParam(index: number) {
    if (params.value.length > 1) {
        params.value.splice(index, 1);
    }
}

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
}
</script>

<template>
    <div class="help-container">
        <h1>welcome to simple pixel</h1>
        <p class="subtitle">Privacy-first, simple visitor tracking for small businesses and individuals</p>

        <section class="help-section">
            <!-- <h2>Why Simple Pixel?</h2> -->
            <div class="value-props">
                <div class="value-prop">
                    <div class="icon">🚀</div>
                    <h3>Dead Simple</h3>
                    <p>No complex setup, no accounts, no configuration. Create a pixel and start tracking in seconds.
                        Perfect for email campaigns, landing pages, or any webpage.</p>
                </div>
                <div class="value-prop">
                    <div class="icon">🔒</div>
                    <h3>Privacy First</h3>
                    <p>IP addresses are hashed immediately and never stored in plain text. User agent details are parsed
                        for device type and browser, then discarded.</p>
                </div>
                <!-- <div class="value-prop">
                    <div class="icon">🏠</div>
                    <h3>Self-Hosted</h3>
                    <p>Keep your data yours. No sending information to big corporations. Deploy on your own server or run locally with Docker.</p>
                </div> -->
                <div class="value-prop">
                    <div class="icon">📊</div>
                    <h3>Just What You Need</h3>
                    <p>Track visitors, device types, locations, and custom parameters. See trends over time. No bloat,
                        no unnecessary features. Just the essentials.</p>
                </div>
            </div>
        </section>

        <section class="help-section" v-if="pixelId">
            <h2>How to Use Your Pixel</h2>

            <div class="step">
                <h3>Step 1: Add Custom Parameters (Optional)</h3>
                <p>Track additional information by adding parameters to your pixel URL. You can add up to {{ maxParams
                    }} parameters:</p>

                <div class="params-builder">
                    <div v-for="(param, index) in params" :key="index" class="param-row">
                        <input v-model="param.key" type="text" placeholder="Parameter name (e.g., campaign)"
                            class="param-input" />
                        <span class="equals">=</span>
                        <input v-model="param.value" type="text" placeholder="Value (e.g., summer-sale)"
                            class="param-input" />
                        <button v-if="params.length > 1" class="remove-btn" @click="removeParam(index)">
                            ✕
                        </button>
                    </div>
                    <button v-if="params.length < maxParams" class="add-btn" @click="addParam">
                        + Add Parameter
                    </button>
                </div>

                <!-- <div v-if="params.some(p => p.key && p.value)" class="generated-url">
                    <strong>Your Pixel URL:</strong>
                    <div class="code-box">
                        <code>{{ embedUrl }}</code>
                        <button class="copy-btn" @click="copyToClipboard(embedUrl)">Copy</button>
                    </div>
                </div> -->

                <div class="examples">
                    <h4>Example Use Cases:</h4>
                    <ul>
                        <li><strong>Email Campaigns:</strong> <code>campaign=newsletter&month=january</code></li>
                        <li><strong>A/B Testing:</strong> <code>variant=a&test=homepage-hero</code></li>
                        <li><strong>Referral Tracking:</strong> <code>source=twitter&medium=social</code></li>
                        <li><strong>User Segments:</strong> <code>plan=premium&cohort=2024-q1</code></li>
                    </ul>
                </div>
            </div>

            <div class="step">
                <h3>Step 2: Embed Your Pixel</h3>
                <p>Copy the code below and paste it into your HTML, email template, or anywhere you want to track
                    visitors:</p>
                <div class="code-box">
                    <code>{{ embedCode }}</code>
                    <button class="copy-btn" @click="copyToClipboard(embedCode)">Copy</button>
                </div>
                <p class="note">The pixel is a transparent 1x1 image that loads invisibly when someone views your page
                    or opens your email.</p>
            </div>

            <div class="step">
                <h3>Step 3: View Your Stats</h3>
                <p>Return to this dashboard to see:</p>
                <ul>
                    <li>Total events and unique visitors</li>
                    <li>Visitor locations on an interactive map</li>
                    <li>Device types, browsers, and operating systems</li>
                    <li>Events over time in a timeline chart</li>
                    <li>Custom parameter values and their frequencies</li>
                </ul>
            </div>
        </section>

        <section class="help-section warning-section">
            <h2>⚠️ Important: Data Retention</h2>
            <p class="warning-text">
                Pixels and all associated event data are <strong>automatically deleted 7 days after creation</strong>.
                Make sure to check your stats regularly or download/export your data before it expires.
                This ensures your data doesn't linger indefinitely and keeps the system lightweight.
            </p>
        </section>

        <section class="help-section">
            <h2>FAQ</h2>

            <div class="faq-item">
                <h3>What data is collected?</h3>
                <p>We collect: timestamp, hashed IP address (for uniqueness, not stored as plain IP), country/region,
                    browser, operating system, device type, and any custom parameters you include in the pixel URL.</p>
            </div>

            <div class="faq-item">
                <h3>How does this protect privacy?</h3>
                <p>IP addresses are immediately hashed using a one-way algorithm. We never store the original IP. User
                    agent strings are parsed for device info and then discarded. We don't use cookies or track users
                    across sites.</p>
            </div>

            <div class="faq-item">
                <h3>Can I use this in emails?</h3>
                <p>Yes, with a caveat. To use it, simply embed the pixel image in your HTML email template. Most of the
                    time, the pixel will fire when a recipient opens the email and loads images. However, some email
                    clients block images by default, or load them through proxy servers, which can affect tracking
                    accuracy.
                </p>
            </div>

            <div class="faq-item">
                <h3>What happens after 7 days?</h3>
                <p>The pixel and all its event data are permanently deleted. You'll need to create a new pixel if you
                    want to continue tracking.</p>
            </div>

            <div class="faq-item">
                <h3>Is there a limit on events?</h3>
                <p>No artificial limits! Track as many events as you need within the 7-day window.</p>
            </div>
        </section>

        <section class="help-section disclaimer-section">
            <h2>Disclaimer</h2>
            <p class="disclaimer-text">
                Simple Pixel is provided "as-is" without any warranties or guarantees of any kind, express or implied.
                The developers and maintainers are not responsible for any data loss, service interruptions, tracking
                inaccuracies, or any other issues that may arise from using this tool. Use at your own risk.
            </p>
            <p class="disclaimer-text">
                While we strive to protect user privacy through IP hashing and minimal data collection, you are
                responsible for ensuring your use of this tracking tool complies with all applicable privacy laws and
                regulations in your jurisdiction (including GDPR, CCPA, etc.). Always inform your users about tracking
                and obtain necessary consent where required.
            </p>
            <p class="disclaimer-text">
                This tool is intended for legitimate tracking purposes such as analytics and campaign monitoring. Any
                misuse, including but not limited to surveillance, harassment, or other malicious activities, is
                strictly prohibited and is solely the responsibility of the user.
            </p>
        </section>

        <!-- <section class="help-section">
            <h2>Need Help?</h2>
            <p>Simple Pixel is designed to be straightforward, but if you run into issues:</p>
            <ul>
                <li>Make sure your pixel URL is correctly embedded in your HTML</li>
                <li>Check that image loading is enabled (some email clients block images by default)</li>
                <li>Verify the pixel ID in your URL matches your dashboard</li>
                <li>Remember that pixels expire after 7 days</li>
            </ul>
        </section> -->
    </div>
</template>

<style scoped>
.help-container {
    padding: var(--spacing-xl);
    max-width: 1000px;
    margin: 0 auto;
}

.help-container h1 {
    font-size: 2.5rem;
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-sm);
    text-align: center;
}

.subtitle {
    text-align: center;
    font-size: 1.var(--spacing-xl);
    color: var(--color-text-light);
    margin-bottom: var(--spacing-xl);
}

.help-section {
    background: white;
    border-radius: 12px;
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-lg);
    box-shadow: var(--shadow-md);
}

.help-section h2 {
    font-size: 1.8rem;
    margin: 0 0 var(--spacing-lg) 0;
    padding-bottom: var(--spacing-sm);
}

.value-props {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
    /* margin-top: var(--spacing-lg); */
}

.value-prop {
    text-align: center;
    padding: var(--spacing-md);
}

.value-prop .icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-sm);
}

.value-prop h3 {
    font-size: 1.var(--spacing-xl);
    color: var(--color-text-primary);
    margin: var(--spacing-sm) 0;
}

.value-prop p {
    font-size: 0.95rem;
    line-height: 1.6;
    color: #555;
    margin: 0;
}

.step {
    margin-bottom: var(--spacing-xl);
}

.step:last-child {
    margin-bottom: 0;
}

.step h3 {
    font-size: 1.3rem;
    color: var(--color-text-primary);
    margin: 0 0 0.75rem 0;
}

.step p {
    font-size: var(--spacing-md);
    line-height: 1.6;
    color: #555;
    margin-bottom: var(--spacing-md);
}

.step ul {
    margin: var(--spacing-sm) 0 0 var(--spacing-lg);
    color: #555;
    line-height: 1.8;
}

.note {
    font-size: 0.9rem;
    color: var(--color-text-light);
    font-style: italic;
    margin-top: var(--spacing-sm);
}

.code-box {
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: var(--spacing-md);
    margin: var(--spacing-md) 0;
    position: relative;
    font-family: 'Courier New', monospace;
    word-break: break-all;
}

.code-box code {
    color: var(--color-text-primary);
    font-size: 0.9rem;
}

.copy-btn {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    padding: 0.4rem 0.8rem;
    background: var(--color-primary);
    color: var(--color-text-white);
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 0.85rem;
    transition: var(--transition-normal);
}

.copy-btn:hover {
    background: var(--color-primary-dark);
}

.params-builder {
    background: #f9f9f9;
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    margin: var(--spacing-md) 0;
}

.param-row {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: 0.75rem;
    align-items: center;
}

.param-input {
    flex: 1;
    padding: 0.6rem;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
}

.param-input:focus {
    border-color: var(--color-primary);
}

.equals {
    color: var(--color-text-lighter);
    font-weight: bold;
}

.remove-btn,
.add-btn {
    background: var(--color-primary);
    color: var(--color-text-white);
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: var(--transition-normal);
    padding: var(--spacing-xs) var(--spacing-sm);
}

.remove-btn {
    padding: 0.4rem 0.6rem;
    font-size: var(--spacing-md);
}

.remove-btn:hover,
.add-btn:hover {
    background: var(--color-primary-dark);
}

.add-btn {
    padding: 0.6rem 1.var(--spacing-xl);
    font-size: 0.95rem;
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 0.95rem;
    transition: var(--transition-normal);
}

.add-btn:hover {
    background: var(--color-primary-dark);
}

.generated-url {
    margin-top: var(--spacing-lg);
}

.generated-url strong {
    display: block;
    margin-bottom: var(--spacing-sm);
    color: var(--color-text-primary);
}

.examples {
    margin-top: var(--spacing-lg);
    padding: var(--spacing-md);
    background: #e8f4f8;
    border-radius: 6px;
}

.examples h4 {
    margin: 0 0 0.75rem 0;
    color: var(--color-text-primary);
}

.examples ul {
    margin: 0 0 0 var(--spacing-lg);
    line-height: 2;
}

.examples code {
    background: white;
    padding: 0.var(--spacing-xl) var(--spacing-sm);
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    color: #d32f2f;
}

.warning-section {
    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    border-left: 5px solid #ff9800;
}

.warning-text {
    font-size: 1.05rem;
    line-height: 1.8;
    color: var(--color-text-primary);
    margin: 0;
}

.faq-item {
    margin-bottom: var(--spacing-lg);
}

.faq-item:last-child {
    margin-bottom: 0;
}

.faq-item h3 {
    font-size: 1.var(--spacing-md);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-sm) 0;
}

.faq-item p {
    font-size: 0.95rem;
    line-height: 1.7;
    color: #555;
    margin: 0;
}

.disclaimer-section {
    border-left: 5px solid #666;
}

.disclaimer-text {
    font-size: 0.9rem;
    line-height: 1.7;
    color: #555;
    margin: 0 0 var(--spacing-md) 0;
}

.disclaimer-text:last-child {
    margin-bottom: 0;
}

@media (max-width: 768px) {
    .help-container {
        padding: var(--spacing-md);
    }

    .help-container h1 {
        font-size: var(--spacing-xl);
    }

    .value-props {
        grid-template-columns: 1fr;
    }

    .param-row {
        flex-direction: column;
        align-items: stretch;
    }

    .equals {
        display: none;
    }
}
</style>
