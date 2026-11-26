package mn.plantai.app;

import android.graphics.Color;
import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import androidx.activity.SystemBarStyle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Android 14 ба түүнээс доош утсан дээр ч edge-to-edge (Android 15+ дээр систем өөрөө хийдэг).
        // Апп бараан тул статус/навигацийн мөрийн icon-уудыг цагаан болгоно.
        // Safe-area зайг вэб тал --safe-area-inset-* CSS хувьсагчаар авдаг (SystemBars plugin).
        EdgeToEdge.enable(this, SystemBarStyle.dark(Color.TRANSPARENT), SystemBarStyle.dark(Color.TRANSPARENT));
    }
}
