// Make sure kubeconfig is setup at ~/.kube/config
// In generated YAML verify storage class once
// Replace namespace and name of PV

const fs = require("fs");
const k8s = require("@kubernetes/client-node");

function generateTemplate(
  pvcName,
  pvcNamespace,
  pvcStorageClass,
  pvcVolumeName,
  pvcSize
) {
  const templateStr = `
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${pvcName}
  namespace: ${pvcNamespace}
spec:
  storageClassName: ${pvcStorageClass}
  volumeName: ${pvcVolumeName}
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: ${pvcSize}

  `;

  return templateStr;
}

async function main() {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  console.log("below context available!");
  const contexts = kc.getContexts();
  console.log(contexts); // this will print all contexts
  kc.setCurrentContext(contexts[0].name); // setting context
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
  const pvs = (await k8sApi.listPersistentVolume()).body.items;

  let op = "";

  pvs.map((pv) => {
    op += generateTemplate(
      "REPLACE NAME",
      "REPLACE NAMESPACE",
      pv.spec.storageClassName,
      pv.metadata.name,
      pv.spec.capacity.storage
    );
  });

  fs.writeFileSync("./pvc.yaml", op);
}

main();
