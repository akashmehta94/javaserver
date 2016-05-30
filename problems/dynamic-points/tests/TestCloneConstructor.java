import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class TestCloneConstructor {

	@Test
	public void testingCloneConstructor() {
		Point point = new Point(1, 2);
		point = new Point(point);

		// assert statements
		assertEquals("getX() must return 1", 1, point.getX(), 0.001);
		assertEquals("getY() must return 2", 2, point.getY(), 0.001);
	}

} 
