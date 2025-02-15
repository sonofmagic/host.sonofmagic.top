# @icebreakers/dns

## 安装

```bash
pnpm add @icebreakers/dns
```

## API 文档

### `dnsRecordsCloudflare(name: string, type: string = 'A')`

通过Cloudflare的DNS-over-HTTPS服务获取DNS记录。

- `name`: 域名，例如 `example.com`
- `type`: DNS记录类型，默认为 `'A'`

返回一个Promise，解析为一个DNS记录数组。

### `prepareDnsRecord(record: DnsRecord)`

准备DNS记录，将记录中的类型数字转换为对应的类型名称。

- `record`: DNS记录对象

返回一个经过准备的DNS记录对象。

## 使用示例

```typescript
import { dnsRecordsCloudflare } from '@icebreakers/dns'

async function getDnsRecords() {
  const records = await dnsRecordsCloudflare('icebreaker.top', 'A')
  console.log(records)
}
```
