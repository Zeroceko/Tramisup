# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - link "Geri dön" [ref=e5] [cursor=pointer]:
        - /url: /dashboard
        - img [ref=e6]
        - text: Geri dön
      - generic [ref=e8]: 1 / 20
    - generic [ref=e9]:
      - generic [ref=e10]:
        - heading "Yeni Ürün Oluştur" [level=1] [ref=e11]
        - link "Kapat" [ref=e12] [cursor=pointer]:
          - /url: /dashboard
          - text: ×
      - generic [ref=e13]:
        - button "Ürünü Anlat" [ref=e14] [cursor=pointer]
        - button "Launch Hedefleri" [disabled] [ref=e15]
        - button "Metrics & Tracking" [disabled] [ref=e16]
        - button "Growth Yaklaşımı" [disabled] [ref=e17]
        - button "Entegrasyonlar" [disabled] [ref=e18]
        - button "Ekip" [disabled] [ref=e19]
        - button "Hızlı Başlangıç" [disabled] [ref=e20]
      - generic [ref=e21]:
        - heading "Ürününüzün adı nedir?" [level=2] [ref=e23]
        - 'textbox "Örn: Tiramisup" [active] [ref=e25]'
      - button "Devam Et" [disabled] [ref=e27]
  - button "Open Next.js Dev Tools" [ref=e33] [cursor=pointer]:
    - img [ref=e34]
  - alert [ref=e37]
```