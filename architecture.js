// Architecture page request-flow scrollytelling

const flowPanel = document.querySelector('.flow-panel');
if (flowPanel) {
    flowPanel.classList.add('has-js');
}

const flowSteps = document.querySelectorAll('.flow-step');
const flowNodes = document.querySelectorAll('.flow-node');
const securityPlane = document.querySelector('.flow-plane-security');
const observabilityPlane = document.querySelector('.flow-plane-observability');

const TOTAL_MAIN_STEPS = 6;

if (flowSteps.length && flowNodes.length) {
    const setActiveFlow = (targetStep) => {
        const index = Array.from(flowSteps).indexOf(targetStep);

        flowSteps.forEach(step => step.classList.toggle('is-active', step === targetStep));

        flowNodes.forEach(node => {
            node.classList.remove('is-active', 'is-governed', 'is-watched');
        });

        if (securityPlane) securityPlane.classList.remove('is-active');
        if (observabilityPlane) observabilityPlane.classList.remove('is-active');

        if (index < TOTAL_MAIN_STEPS) {
            const layer = targetStep.dataset.flow;

            flowNodes.forEach(node => {
                if (node.dataset.flow === layer) {
                    node.classList.add('is-active');
                }
            });
        } else if (index === TOTAL_MAIN_STEPS) {
            if (securityPlane) securityPlane.classList.add('is-active');

            flowNodes.forEach(node => {
                const n = parseInt(node.dataset.flow, 10);
                if (n === 5) node.classList.add('is-active');
                if (n === 2 || n === 4) node.classList.add('is-governed');
            });
        } else {
            if (observabilityPlane) observabilityPlane.classList.add('is-active');

            flowNodes.forEach(node => {
                node.classList.add('is-watched');
            });
        }
    };

    const flowObserver = new IntersectionObserver((entries) => {
        const intersecting = entries.filter(entry => entry.isIntersecting).map(entry => entry.target);
        if (intersecting.length === 0) return;

        const viewportCenter = window.innerHeight / 2;
        let closestStep = intersecting[0];
        let closestDistance = Infinity;

        intersecting.forEach(step => {
            const rect = step.getBoundingClientRect();
            const stepCenter = rect.top + rect.height / 2;
            const distance = Math.abs(stepCenter - viewportCenter);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestStep = step;
            }
        });

        setActiveFlow(closestStep);
    }, {
        threshold: 0,
        rootMargin: '-42% 0px -42% 0px'
    });

    flowSteps.forEach(step => flowObserver.observe(step));
}
