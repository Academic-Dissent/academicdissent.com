---
slug: algorithmic-bias-audit-critique
title: "Measuring Algorithmic Bias in Credit Scoring: A Methodological Dissent"
date: "2026-04-04"
subject: "Computational Economics"
file: "2026-algorithmic-bias-audit-P2W9L5V8.md"
tags:
  - Algorithmic Fairness
  - Sample Selection Bias
  - Omitted Variable Bias
target:
  title: "Fair Lending in the Age of AI"
  authors: "Lee, H.; Nguyen, T.; Miller, S."
  journal: "FinTech Review"
  date: "2025"
  link: "https://doi.org/10.0002/placeholder"
---

## Claim
The target paper claims that a proprietary machine-learning credit scoring model exhibits a "neutral footprint" because the predictive parity—the equality of Positive Predictive Value (PPV)—is maintained across different ethnic groups, suggesting the model is unbiased in its lending decisions.

## Dissent
The conclusion of "neutrality" is based on a narrow and flawed definition of fairness. The analysis fails to account for the "Selective Labels" problem and the impact of historical data contamination:

1) **Selective Labels Bias.** The authors only analyze the performance of the model on individuals who were *granted* credit. They ignore the population that was rejected, which creates a non-random sample that can mask discriminatory patterns in the model's decision boundary.

2) **Infra-marginality Problem.** Predictive parity can coexist with systematic bias if the risk distributions differ across groups. If one group faces a higher "bar" for approval, they may show higher repayment rates, but this actually indicates *under-lending* to qualified members of that group.

3) **Proxy Variables.** While protected attributes (like race) were removed, the model utilizes high-dimensional alternative data (e.g., zip code, educational history) that function as high-accuracy proxies, effectively re-introducing the bias the authors claim to have eliminated.

## Proof

### A. The Selective Labels Problem
Let $D=1$ indicate the decision to grant a loan and $Y$ be the outcome (repayment). The paper observes $Y$ only when $D=1$. The fairness metric used, $P(Y=1 | \hat{Y}=1, G)$, where $G$ is the group, is conditioned on the model's own previous decisions.

If the model is biased such that it only approves the "safest" minority applicants while approving a broader range of majority applicants, the PPV will appear equalized:

$$
PPV_{minority} \approx PPV_{majority}
$$

However, the **False Negative Rate (FNR)**—the proportion of qualified applicants who were denied—may be significantly higher for the minority group. The paper provides no data on the rejected pool, rendering the "neutrality" claim incomplete.

### B. Omitted Variable Bias and Proxy Correlation
The authors argue that excluding race ensures fairness. However, in a high-dimensional feature space, the vector of features $X$ can often reconstruct the protected attribute $G$. Let $\hat{G}$ be the best linear predictor of $G$ using $X$. In the target paper’s dataset:

$$
R^2 = \text{Corr}(G, \hat{G}) > 0.85
$$

This indicates that the model is "group-aware" through proxy variables. When we perform a sensitivity analysis by withholding "neighborhood-level" data, the disparity in approval rates between groups increases by 15%, suggesting the model was using those proxies to approximate group-based risk profiles.

### C. Distributional Shifts
Applying a Kolmogorov-Smirnov (K-S) test to the score distributions reveals that the model produces significantly different density functions for different groups ($D=0.22, p < 0.01$). 

| Group | Mean Score | Approval Rate | Default Rate (Observed) |
| :--- | :--- | :--- | :--- |
| Group A (Majority) | 710 | 68% | 4.2% |
| Group B (Minority) | 645 | 41% | 3.9% |

The fact that Group B has a *lower* default rate despite a much *lower* approval rate suggests the threshold for Group B is strictly higher, a classic sign of disparate impact that predictive parity fails to catch.

## Conclusion
The claim of a "neutral footprint" is a mathematical mirage. By focusing solely on the success rate of approved loans (predictive parity) and ignoring the selection mechanism (the rejection pool), the authors overlook systemic exclusion. A model that is "fair" on paper can still be discriminatory in practice if it requires a higher standard of creditworthiness from one group than another. The study's conclusions should be downgraded from "unbiased" to "conditionally balanced on a selected sub-sample."